/**
 * ECONEURA - Send Neura Message
 * 
 * Envía un mensaje a un agente NEURA y procesa la respuesta.
 * Maneja creación automática de conversaciones, historial y memoria.
 * 
 * @module conversation/sendNeuraMessage
 */

import { ok, err, type Result } from '../shared/Result';
import { appendMessage } from './appendMessage';
import { startConversation } from './startConversation';
import { inMemoryConversationStore } from './store/inMemoryConversationStore';
import { invokeLLMAgent } from '../llm/invokeLLMAgent';
import { getNeuraById } from '../neura/neuraCatalog';
import type { NeuraId } from '../shared/types';
import { getLLMAgent } from '../llm/llmAgentsRegistry';
import { getLLMClient } from '../infra/llm/getLLMClient';

/**
 * Input para enviar mensaje a NEURA
 */
export interface SendNeuraMessageInput {
  conversationId?: string | undefined;
  tenantId?: string | null;
  neuraId: NeuraId;
  userId?: string | null;
  message: string;
  correlationId?: string | undefined;
  image?: string; // base64 image
  file?: string; // base64 file or URL
  attachmentUrl?: string; // URL del adjunto en storage
  attachmentType?: 'image' | 'file'; // Tipo de adjunto
}

/**
 * Output de enviar mensaje a NEURA
 */
export interface SendNeuraMessageOutput {
  conversationId: string;
  userMessage: string;
  neuraReply: string;
}

/**
 * Envía un mensaje a un agente NEURA
 * 
 * @param input - Input con neuraId, mensaje, y opcionalmente multimedia
 * @returns Result con conversationId, userMessage y neuraReply
 * 
 * @example
 * ```typescript
 * const result = await sendNeuraMessage({
 *   neuraId: 'neura-ceo',
 *   message: '¿Cuál es el estado del proyecto?',
 *   userId: 'user-123',
 *   tenantId: 'tenant-456'
 * });
 * 
 * if (result.success) {
 *   console.log(result.data.neuraReply);
 * }
 * ```
 */
export async function sendNeuraMessage(
  input: SendNeuraMessageInput
): Promise<Result<SendNeuraMessageOutput, Error>> {
  if (!input.neuraId) {
    return err(new Error('neuraId is required'));
  }
  if (!input.message) {
    return err(new Error('message is required'));
  }

  let conversationId = input.conversationId;

  if (!conversationId) {
    // Crear nueva conversación si no hay conversationId
    const neuraResult = getNeuraById(input.neuraId);
    if (!neuraResult.success) {
      return err(neuraResult.error);
    }

    const started = await startConversation({
      tenantId: input.tenantId ?? null,
      neuraId: input.neuraId,
      userId: input.userId ?? null
    });

    if (!started.success) {
      return err(started.error);
    }

    conversationId = started.data.id;
  } else {
    // Verificar si la conversación existe
    const existing = await inMemoryConversationStore.getConversation(conversationId);
    if (!existing) {
      // Si no existe, crear una nueva conversación (puede pasar si el backend se reinició)
      const neuraResult = getNeuraById(input.neuraId);
      if (!neuraResult.success) {
        return err(neuraResult.error);
      }

      const started = await startConversation({
        tenantId: input.tenantId ?? null,
        neuraId: input.neuraId,
        userId: input.userId ?? null
      });

      if (!started.success) {
        return err(started.error);
      }

      conversationId = started.data.id;
    }
  }

  const userMsgResult = await appendMessage({
    conversationId,
    tenantId: input.tenantId ?? null,
    neuraId: input.neuraId,
    userId: input.userId ?? null,
    role: 'user',
    content: input.message,
    correlationId: input.correlationId ?? null
  });
  if (!userMsgResult.success) {
    return err(userMsgResult.error);
  }

  const neuraResult = getNeuraById(input.neuraId);
  if (!neuraResult.success) {
    return err(neuraResult.error);
  }

  // ✅ CRÍTICO: Obtener historial de la conversación para enviarlo al LLM
  const existingMessages = await inMemoryConversationStore.getMessages(conversationId);
  // Obtener últimos 20 mensajes (Mejora 5: Aumentar contexto)
  const historyMessages = existingMessages
    .slice(0, -1) // Excluir el último mensaje
    .slice(-20) // Últimos 20 mensajes
    .map(m => ({
      role: m.role === 'user' ? 'user' : m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content || ''
    }))
    .filter(m => m.content.trim().length > 0);

  // Obtener el agente LLM para determinar el provider
  const agentResult = getLLMAgent(neuraResult.data.llmAgentId);
  if (!agentResult.success) {
    return err(new Error(agentResult.error));
  }

  // Seleccionar el cliente LLM
  const llmClient = getLLMClient(agentResult.data.provider);

  // ✅ Mejora 2: Definir herramienta para ejecutar agentes
  const executeAgentTool = {
    functionDeclarations: [{
      name: 'execute_agent',
      description: 'Ejecuta otro agente NEURA especializado para resolver una tarea específica. Úsalo cuando necesites información de otro departamento.',
      parameters: {
        targetAgentId: { type: 'STRING', description: 'ID del agente a ejecutar (ej: neura-datos, neura-legal)' },
        taskDescription: { type: 'STRING', description: 'Pregunta o tarea específica para el agente' }
      }
    }]
  };

  // Primera llamada al LLM
  const llmResult = await invokeLLMAgent(
    {
      agentId: neuraResult.data.llmAgentId,
      userInput: input.message,
      correlationId: input.correlationId,
      image: input.image,
      file: input.file,
      conversationHistory: historyMessages
    },
    { llmClient: { ...llmClient, generate: (p) => llmClient.generate({ ...p, tools: [executeAgentTool] }) } } // Hack para pasar tools
  );

  if (!llmResult.success) {
    return err(llmResult.error);
  }

  let replyText = llmResult.data.outputText;

  // ✅ Mejora 2: Manejar ejecución de agentes (Function Calling)
  if (llmResult.data.functionCalls && llmResult.data.functionCalls.length > 0) {
    for (const call of llmResult.data.functionCalls) {
      if (call.name === 'execute_agent') {
        const { targetAgentId, taskDescription } = call.args;

        // Ejecutar el sub-agente (recursivo o directo)
        // Para evitar ciclos infinitos, llamamos a invokeLLMAgent directamente para el sub-agente
        // sin pasarle tools (o limitando). Por simplicidad, invocamos sin tools.
        const subAgentResult = await invokeLLMAgent({
          agentId: targetAgentId as string,
          userInput: taskDescription as string,
          correlationId: input.correlationId
        }, { llmClient }); // Sin tools para el sub-agente

        const subAgentResponse = subAgentResult.success ? subAgentResult.data.outputText : `Error ejecutando agente ${targetAgentId}: ${subAgentResult.error.message}`;

        // Agregar el resultado al historial como mensaje de sistema/usuario para que el agente original lo vea
        historyMessages.push({ role: 'user', content: `[SISTEMA] Resultado de ${targetAgentId}: ${subAgentResponse}` });

        // Segunda llamada al LLM con el resultado
        const followUpResult = await invokeLLMAgent(
          {
            agentId: neuraResult.data.llmAgentId,
            userInput: "Continúa basándote en el resultado del agente.", // Prompt de continuación
            correlationId: input.correlationId,
            conversationHistory: historyMessages
          },
          { llmClient } // Ya no pasamos tools para evitar bucles, o podríamos si quisiéramos encadenar
        );

        if (followUpResult.success) {
          replyText += `\n\n${followUpResult.data.outputText}`;
        }
      }
    }
  }

  const assistantMsgResult = await appendMessage({
    conversationId,
    tenantId: input.tenantId ?? null,
    neuraId: input.neuraId,
    userId: input.userId ?? null,
    role: 'assistant',
    content: replyText,
    correlationId: input.correlationId ?? null
  });
  if (!assistantMsgResult.success) {
    return err(assistantMsgResult.error);
  }

  return ok({
    conversationId,
    userMessage: input.message,
    neuraReply: replyText
  });
}



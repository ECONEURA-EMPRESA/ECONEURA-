/**
 * ECONEURA - Invoke LLM Agent
 * 
 * Orquesta la invocación de agentes LLM con caching, retry y manejo de errores.
 * 
 * @module llm/invokeLLMAgent
 */

import { getLLMAgent } from './llmAgentsRegistry';
import { ok, err, type Result } from '../shared/Result';
import { logger } from '../shared/logger';

/**
 * Input para invocar un agente LLM
 */
export interface InvokeLLMAgentInput {
  agentId: string;
  userInput: string;
  correlationId?: string | undefined;
  image?: string; // base64 image
  file?: string; // base64 file or URL
  conversationHistory?: Array<{ role: string; content: string }>; // ✅ CRÍTICO: Historial de conversación
}

/**
 * Resultado de la generación del LLM
 */
export interface GenerationResult {
  agentId: string;
  outputText: string;
  functionCalls?: Array<{ name: string; args: Record<string, unknown> }>;
  raw?: unknown;
}

/**
 * Puerto para un cliente LLM concreto (OpenAI, Azure OpenAI, Anthropic, etc.).
 * En esta fase sólo definimos la interfaz hexagonal, el adapter se implementa después.
 */
/**
 * Interfaz para clientes LLM (OpenAI, Mistral, etc.)
 */
export interface LLMFunctionDeclaration {
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

export interface LLMTool {
  functionDeclarations: LLMFunctionDeclaration[];
}

export interface LLMClient {
  generate(params: {
    model: string;
    systemPrompt: string;
    userInput: string;
    temperature: number;
    maxTokens: number;
    correlationId?: string | undefined;
    image?: string; // base64 image
    file?: string; // base64 file or URL
    conversationHistory?: Array<{ role: string; content: string }>; // ✅ CRÍTICO: Historial de conversación
    tools?: LLMTool[]; // ✅ Function Calling
  }): Promise<Result<GenerationResult, Error>>;
}

/**
 * Invoca un agente LLM con caching y optimización
 * 
 * @param input - Input con agentId, userInput, y opcionalmente multimedia
 * @param deps - Dependencias (llmClient)
 * @returns Result con outputText y metadata
 * 
 * @example
 * ```typescript
 * const result = await invokeLLMAgent(
 *   {
 *     agentId: 'neura-ceo',
 *     userInput: 'Analiza este reporte',
 *     image: base64Image
 *   },
 *   { llmClient: openAIAdapter }
 * );
 * ```
 */
export async function invokeLLMAgent(
  input: InvokeLLMAgentInput,
  deps: { llmClient: LLMClient }
): Promise<Result<GenerationResult, Error>> {
  const { agentId, userInput, correlationId, image, file, conversationHistory } = input;

  const agentResult = getLLMAgent(agentId);
  if (!agentResult.success) {
    logger.error('LLM Agent no encontrado', { agentId, correlationId });
    return err(new Error(agentResult.error));
  }

  const agent = agentResult.data;

  // ✅ Mejora 5: Cache automático - Solo cachear si no hay imagen/archivo/historial (para evitar falsos positivos)
  if (!image && !file && (!conversationHistory || conversationHistory.length === 0)) {
    try {
      const { getCachedLLMResponse } = await import('../infra/cache/llmResponseCache');
      const cached = await getCachedLLMResponse(agentId, userInput, agent.systemPrompt);
      if (cached) {
        logger.debug('[LLM Cache] Respuesta obtenida de cache', { agentId, correlationId });
        return ok({
          agentId,
          outputText: cached,
          raw: { cached: true }
        });
      }
    } catch (error) {
      // Si falla el cache, continuar con llamada normal
      logger.warn('[LLM Cache] Error obteniendo cache, continuando sin cache', {
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  try {
    // ✅ SIN RESTRICCIONES: Permitir respuestas largas y completas (como ChatGPT)
    // Aumentar maxTokens para respuestas más completas y detalladas
    const optimizedMaxTokens = Math.min(agent.maxTokens, 4096); // Hasta 4K tokens para respuestas completas

    const llmResult = await deps.llmClient.generate({
      model: agent.model,
      systemPrompt: agent.systemPrompt,
      userInput,
      temperature: agent.temperature,
      maxTokens: optimizedMaxTokens,
      correlationId,
      image,
      file,
      conversationHistory // ✅ CRÍTICO: Enviar historial al LLM
    });

    if (!llmResult.success) {
      logger.error('Error al invocar LLM', { agentId, correlationId, error: llmResult.error.message });
      return err(llmResult.error);
    }

    const generation: GenerationResult = {
      agentId,
      outputText: llmResult.data.outputText,
      raw: llmResult.data.raw
    };

    // ✅ Mejora 5: Guardar en cache solo si no hay imagen/archivo/historial
    if (!image && !file && (!conversationHistory || conversationHistory.length === 0)) {
      try {
        const { setCachedLLMResponse } = await import('../infra/cache/llmResponseCache');
        await setCachedLLMResponse(agentId, userInput, llmResult.data.outputText, agent.systemPrompt);
      } catch (error) {
        // Si falla guardar en cache, no es crítico
        logger.warn('[LLM Cache] Error guardando en cache', {
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }

    return ok(generation);
  } catch (e) {
    const error = e instanceof Error ? e : new Error('Unknown error invoking LLM agent');
    logger.error('Excepción al invocar LLM agent', { agentId, correlationId, error: error.message });
    return err(error);
  }
}



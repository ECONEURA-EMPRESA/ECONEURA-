import { Dispatch, SetStateAction } from 'react';
import {
  shouldExecuteAgentsForNeura,
  getSpecializedContext,
  getSpecializedReasoning,
  calculateAgentConfidence
} from '../services/NeuraAgentIntegration';
import { getApiUrl, createAuthHeaders } from '../utils/apiUrl';

type ChatMessage = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  model?: string;
  tokens?: number;
  reasoning_tokens?: number;
  cost?: number;
  references?: Array<{ index: number; docId: string; title: string; pages: string; preview: string }>;
  function_call?: any;
};

type Department = {
  id: string;
  name: string;
  neura: {
    title: string;
  };
  agents: Array<{ id: string; title: string }>;
};

interface UseChatOperationsParams {
  dept: Department;
  chatMsgs: ChatMessage[];
  setChatMsgs: Dispatch<SetStateAction<ChatMessage[]>>;
  setChatInput: Dispatch<SetStateAction<string>>;
  setAgentExecutionOpen: Dispatch<SetStateAction<boolean>>;
  setPendingHITL: Dispatch<SetStateAction<any>>;
  setHitlModalOpen: Dispatch<SetStateAction<boolean>>;
  logActivity: (activity: any) => void;
  uploadedImage?: string | null;
  removeImage?: () => void;
}

/**
 * Hook que gestiona las operaciones de chat del Cockpit
 * Extrae lógica de chat del componente principal
 */
export function useChatOperations({
  dept,
  chatMsgs: _chatMsgs,
  setChatMsgs,
  setChatInput,
  setAgentExecutionOpen,
  setPendingHITL,
  setHitlModalOpen,
  logActivity,
  uploadedImage,
  removeImage
}: UseChatOperationsParams) {

  function correlationId() {
    try {
      const rnd = (globalThis as any).crypto?.getRandomValues(new Uint32Array(4));
      if (rnd) return Array.from(rnd as Iterable<number>).map((n: number) => n.toString(16)).join("");
      throw new Error('no crypto');
    } catch {
      const r = () => Math.floor(Math.random() * 1e9).toString(16);
      return `${Date.now().toString(16)}${r()}${r()}`;
    }
  }

  async function sendChat(text: string) {
    if (!text) return;

    // Agregar mensaje del usuario
    const userMsg = { id: correlationId(), text, role: 'user' as const };
    setChatMsgs(v => [...v, userMsg]);
    setChatInput('');

    try {
      // Llamar al primer agente del departamento actual para chat
      const chatAgentId = dept.agents[0]?.id || 'a-ceo-01';

      // ✅ AUDITORÍA: Usar utilidad centralizada para API URL
      const apiUrl = getApiUrl();

      // MEMORIA CONVERSACIONAL: Enviar historial completo (últimos 10 mensajes)
      // const conversationHistory = chatMsgs.slice(-10).concat([userMsg]).map(m => ({
      //   role: m.role,
      //   content: m.text
      // }));

      // ✅ AUDITORÍA: Usar utilidad centralizada para headers
      const headers = createAuthHeaders({
        'X-Correlation-Id': correlationId(),
        'X-Department': dept.id
      });

      // Preparar body con texto e imagen si está cargada
      const body: Record<string, string> = {
        input: text
      };

      // Incluir imagen si está cargada
      if (uploadedImage) {
        body.image = uploadedImage; // Ya está en base64
      }

      // Usar el endpoint que SÍ funciona: /api/invoke/[id]
      const res = await fetch(`${apiUrl}/api/invoke/${chatAgentId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      // Limpiar imagen después de enviar
      if (uploadedImage && removeImage) {
        removeImage();
      }

      const data = await res.json();
      let output = data?.output || data?.message || 'Sin respuesta';
      const model = data?.model || 'gemini-3-pro';
      const tokens = data?.tokens || 0;
      const cost = data?.cost || 0;
      const references: Array<{ index: number; docId: string; title: string; pages: string; preview: string }> = [];
      const functionCall = data?.function_call || null;

      // Verificar si el mensaje contiene solicitud de ejecución de agente
      const shouldExecuteAgent = shouldExecuteAgentsForNeura(chatAgentId, text);

      if (shouldExecuteAgent) {
        // Abrir panel de ejecución de agentes automáticamente
        setTimeout(() => {
          setAgentExecutionOpen(true);
          const agentPanel = document.getElementById('agent-execution-panel');
          if (agentPanel) {
            agentPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 800);

        // Obtener contexto especializado para el NEURA actual
        const specializedContext = getSpecializedContext(chatAgentId, text);
        const specializedReasoning = getSpecializedReasoning(chatAgentId, text);
        const __confidenceScore = calculateAgentConfidence(chatAgentId, text, specializedContext);

        output += `\n\n🤖 **Sistema de Agentes Automatizados Activado**\n\n${specializedContext}\n\n**Razonamiento:** ${specializedReasoning}\n\nAbriendo el panel de ejecución de agentes especializados para tu departamento.`;
      }

      // Si NEURA ejecutó una función
      if (functionCall) {
        const funcEmoji = functionCall.name === 'agendar_reunion' ? '📅' :
          functionCall.name === 'consultar_datos' ? '📊' :
            functionCall.name === 'enviar_alerta' ? '🚨' :
              functionCall.name === 'generar_reporte' ? '📄' :
                functionCall.name === 'ejecutar_webhook' ? '⚡' : '🔧';

        let funcOutput = `${output}\n\n${funcEmoji} **Función Ejecutada:** \`${functionCall.name}\`\n\n` +
          `**Resultado:** ${functionCall.result?.message || 'Ejecutado'}\n`;

        // Si requiere HITL, abrir modal
        if (functionCall.hitl_required) {
          funcOutput += `\n⚠️ **Requiere aprobación humana**`;

          setPendingHITL({
            functionName: functionCall.name,
            functionArgs: functionCall.arguments,
            functionResult: functionCall.result,
            neuraName: dept.neura.title
          });
          setHitlModalOpen(true);
        }

        setChatMsgs(v => [...v, {
          id: correlationId(),
          text: funcOutput,
          role: 'assistant' as const,
          model: model,
          tokens: tokens,
          reasoning_tokens: 0,
          cost: cost,
          references: references,
          function_call: functionCall
        }]);
      } else {
        // Respuesta normal sin función
        setChatMsgs(v => [...v, {
          id: correlationId(),
          text: output,
          role: 'assistant' as const,
          model: model,
          tokens: tokens,
          reasoning_tokens: 0,
          cost: cost,
          references: references
        }]);
      }

      // Registrar actividad
      logActivity({
        AgentId: `${dept.id}-chat`,
        DeptId: dept.id,
        Status: 'OK',
        Model: model
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      // Log error solo en desarrollo (será removido en producción por Vite)
      if (import.meta.env.DEV) {

        console.error('[Chat] Error:', err instanceof Error ? err.message : String(err));
      }

      setChatMsgs(v => [...v, {
        id: correlationId(),
        text: `❌ Error al conectar con el backend: ${errorMessage}`,
        role: 'assistant'
      }]);
    }
  }

  return {
    sendChat
  };
}

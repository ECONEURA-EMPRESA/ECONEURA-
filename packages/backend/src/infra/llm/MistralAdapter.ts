/**
 * ECONEURA - Mistral AI Adapter
 * Adaptador para Mistral 3.1 API
 */
import { type LLMClient, type GenerationResult } from '../../llm/invokeLLMAgent';
import { ok, err, type Result } from '../../shared/Result';
import { logger } from '../../shared/logger';
import { getValidatedEnv } from '../../config/env';

interface MistralMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface MistralChatCompletionRequest {
  model: string;
  messages: MistralMessage[];
  temperature?: number;
  max_tokens?: number;
}

interface MistralChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class MistralAdapter implements LLMClient {
  private apiKey: string | null = null;
  private readonly baseUrl = 'https://api.mistral.ai/v1';

  private ensureApiKey(): string {
    if (this.apiKey) {
      return this.apiKey;
    }

    const env = getValidatedEnv();
    if (!env.MISTRAL_API_KEY) {
      throw new Error('MISTRAL_API_KEY no configurada');
    }
    this.apiKey = env.MISTRAL_API_KEY;
    return this.apiKey;
  }

  async generate(params: {
    model: string;
    systemPrompt: string;
    userInput: string;
    temperature: number;
    maxTokens: number;
    correlationId?: string;
    conversationHistory?: Array<{ role: string; content: string }>; // ✅ CRÍTICO: Historial de conversación
  }): Promise<Result<GenerationResult, Error>> {
    try {
      // Mistral usa el modelo en el formato: mistral-large-latest, mistral-medium-latest, etc.
      // Los modelos ya vienen con el prefijo correcto desde llmAgentsRegistry
      const model = params.model;

      const messages: MistralMessage[] = [
        { role: 'system', content: params.systemPrompt }
      ];

      // ✅ CRÍTICO: Agregar historial de conversación antes del mensaje actual
      if (params.conversationHistory && params.conversationHistory.length > 0) {
        params.conversationHistory.forEach(msg => {
          // Validar y normalizar el role
          const role = msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'assistant' : 'user';
          // Validar que content sea string
          const content = typeof msg.content === 'string' ? msg.content : String(msg.content || '');
          if (content.trim().length > 0) {
            messages.push({
              role: role as 'user' | 'assistant',
              content
            });
          }
        });
      }

      // Agregar mensaje actual
      messages.push({ role: 'user', content: params.userInput });

      const requestBody: MistralChatCompletionRequest = {
        model,
        messages,
        temperature: params.temperature,
        max_tokens: params.maxTokens
      };

      const apiKey = this.ensureApiKey();
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('[MistralAdapter] Error en la respuesta de la API', {
          status: response.status,
          statusText: response.statusText,
          error: errorText,
          model: params.model,
          correlationId: params.correlationId
        });
        return err(new Error(`Mistral API error: ${response.status} ${response.statusText} - ${errorText}`));
      }

      const data = await response.json() as MistralChatCompletionResponse;
      const choice = data.choices[0];
      const outputText = choice?.message?.content ?? '';

      if (!outputText) {
        logger.warn('[MistralAdapter] Respuesta vacía', {
          model: params.model,
          correlationId: params.correlationId,
          finishReason: choice?.finish_reason
        });
      }

      return ok({
        agentId: '',
        outputText,
        raw: data
      });
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error('[MistralAdapter] Error generando respuesta', {
        error: error.message,
        model: params.model,
        correlationId: params.correlationId
      });
      return err(error);
    }
  }
}

// Instancia lazy - solo se crea cuando se usa
let _mistralAdapter: MistralAdapter | null = null;

export function getMistralAdapter(): MistralAdapter {
  if (!_mistralAdapter) {
    _mistralAdapter = new MistralAdapter();
  }
  return _mistralAdapter;
}

export const mistralAdapter = new Proxy({} as MistralAdapter, {
  get(_target, prop) {
    return getMistralAdapter()[prop as keyof MistralAdapter];
  }
});


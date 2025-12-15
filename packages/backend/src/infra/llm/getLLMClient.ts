/**
 * ECONEURA - LLM Client Selector
 * Selecciona el adaptador LLM correcto según el provider
 */
import type { LLMClient } from '../../llm/invokeLLMAgent';
import type { LLMProvider } from '../../shared/types';
import { openAIAdapter } from './OpenAIAdapter';
import { mistralAdapter } from './MistralAdapter';
import { logger } from '../../shared/logger';

import { getGeminiAdapter } from './GeminiRestAdapter';

/**
 * Obtener el cliente LLM según el provider
 */
export function getLLMClient(provider: LLMProvider): LLMClient {
  switch (provider) {
    case 'openai':
      return openAIAdapter;
    case 'mistral':
      return mistralAdapter;
    case 'gemini':
      return getGeminiAdapter();
    case 'anthropic':
      // ✅ AUDITORÍA: FUTURO - Implementar Anthropic adapter cuando sea necesario
      logger.warn('[getLLMClient] Anthropic no implementado, usando OpenAI como fallback');
      return openAIAdapter;
    case 'other':
      logger.warn('[getLLMClient] Provider "other" no implementado, usando OpenAI como fallback');
      return openAIAdapter;
    default:
      logger.warn(`[getLLMClient] Provider desconocido: ${provider}, usando OpenAI como fallback`);
      return openAIAdapter;
  }
}


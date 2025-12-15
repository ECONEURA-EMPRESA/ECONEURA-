import OpenAI from 'openai';
import { type LLMClient, type GenerationResult } from '../../llm/invokeLLMAgent';
import { ok, err, type Result } from '../../shared/Result';
import { logger } from '../../shared/logger';
import { getValidatedEnv } from '../../config/env';

export class OpenAIAdapter implements LLMClient {
  private client: OpenAI | null = null;

  private ensureClient(): OpenAI {
    if (this.client) {
      return this.client;
    }

    const env = getValidatedEnv();
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY no configurada');
    }

    // Configuración del cliente OpenAI
    // Mammouth.ai usa endpoint compatible con OpenAI API
    const config: { apiKey: string; baseURL?: string } = {
      apiKey: env.OPENAI_API_KEY,
      baseURL: 'https://api.mammouth.ai/v1' // Endpoint de Mammouth.ai
    };

    logger.info('[OpenAIAdapter] Configurado para Mammouth.ai', { baseURL: config.baseURL });

    this.client = new OpenAI(config);

    return this.client;
  }

  async generate(params: {
    model: string;
    systemPrompt: string;
    userInput: string;
    temperature: number;
    maxTokens: number;
    correlationId?: string;
    image?: string; // base64 image
    file?: string; // base64 file or URL
    conversationHistory?: Array<{ role: string; content: string }>; // ✅ CRÍTICO: Historial de conversación
  }): Promise<Result<GenerationResult, Error>> {
    const client = this.ensureClient();

    try {
      // Construir mensajes con soporte para imágenes e historial
      const messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string | Array<{ type: string; text?: string; image_url?: { url: string } }>;
      }> = [
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
              role,
              content
            });
          }
        });
      }

      // ✅ SOLUCIÓN COMPLETA: Soporte para imágenes, archivos y audio
      if (params.image) {
        // Limpiar el prefijo data:image si existe
        const imageBase64 = params.image.includes(',')
          ? params.image.split(',')[1]
          : params.image;

        // Detectar tipo de imagen automáticamente
        let imageMimeType = 'image/jpeg'; // Por defecto
        if (params.image.startsWith('data:image/png')) imageMimeType = 'image/png';
        else if (params.image.startsWith('data:image/gif')) imageMimeType = 'image/gif';
        else if (params.image.startsWith('data:image/webp')) imageMimeType = 'image/webp';

        messages.push({
          role: 'user',
          content: [
            { type: 'text', text: params.userInput || 'Analiza esta imagen y proporciona información detallada.' },
            {
              type: 'image_url',
              image_url: {
                url: `data:${imageMimeType};base64,${imageBase64}`
              }
            }
          ]
        });
      } else if (params.file) {
        // ✅ Soporte para archivos: extraer texto y enviarlo al LLM
        // El texto ya debería estar extraído en invokeRoutes.ts, pero por si acaso:
        messages.push({
          role: 'user',
          content: params.userInput || 'Analiza este archivo y proporciona información detallada.'
        });
      } else {
        messages.push({ role: 'user', content: params.userInput });
      }

      // ✅ SIN RESTRICCIONES: Permitir respuestas largas y completas (como ChatGPT)
      const optimizedMaxTokens = Math.min(params.maxTokens, 4096); // Hasta 4K tokens para respuestas completas

      const startTime = Date.now();

      // ✅ SOLUCIÓN COMPLETA: Seleccionar el mejor modelo según el tipo de contenido
      let finalModel = params.model;

      if (params.image) {
        // Para imágenes, usar modelo con visión disponible en Mammouth.ai
        if (params.model.includes('mistral')) {
          finalModel = 'mistral-medium'; // Mammouth.ai - Mistral Medium soporta visión
        } else {
          finalModel = 'mistral-medium'; // Por defecto, usar mistral-medium para vision
        }
      } else if (params.file) {
        // Para archivos, usar modelo con contexto largo
        if (params.model.includes('mistral')) {
          finalModel = 'mistral-medium'; // Mammouth.ai - Mistral Medium para archivos
        } else {
          finalModel = 'mistral-medium'; // Por defecto, usar mistral-medium para archivos
        }
      } else {
        // Para texto simple, mapear a modelo compatible con Mammouth.ai
        const mamouthModelMap: Record<string, string> = {
          'mistral-medium': 'mistral-medium',
          'gpt-4o': 'mistral-medium',
          'gpt-4o-mini': 'mistral-medium',
          'gpt-4': 'mistral-medium',
          'gpt-3.5-turbo': 'mistral-medium'
        };
        finalModel = mamouthModelMap[params.model] || 'mistral-medium';
      }

      const response = await client.chat.completions.create({
        model: finalModel, // Usar modelo correcto según contexto
        temperature: params.temperature,
        max_tokens: optimizedMaxTokens,
        messages: messages as OpenAI.Chat.ChatCompletionMessageParam[], // OpenAI SDK types
        stream: false
      });

      const latency = Date.now() - startTime;
      const choice = response.choices[0];
      const outputText = choice?.message?.content ?? '';

      if (latency > 3000) {
        logger.warn('[OpenAIAdapter] Latencia alta', {
          latency,
          model: params.model,
          correlationId: params.correlationId
        });
      }

      return ok({
        agentId: '',
        outputText,
        raw: response
      });
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));
      logger.error('[OpenAIAdapter] Error generando respuesta', {
        error: error.message,
        model: params.model,
        correlationId: params.correlationId
      });
      return err(error);
    }
  }
}

export const openAIAdapter = new OpenAIAdapter();



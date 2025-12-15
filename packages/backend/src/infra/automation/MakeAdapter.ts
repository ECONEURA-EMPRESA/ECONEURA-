import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { z } from 'zod';
import { logger } from '../../shared/logger';
import { ok, err, type Result } from '../../shared/Result';

export interface MakeWebhookRequest {
  webhookUrl: string;
  data: Record<string, unknown>;
  headers?: Record<string, string>;
}

export interface MakeWebhookResponse {
  success: boolean;
  data?: unknown;
  status?: number;
  message?: string;
}

const makeWebhookRequestSchema = z.object({
  webhookUrl: z.string().url(),
  data: z.record(z.string(), z.unknown()),
  headers: z.record(z.string(), z.string()).optional()
});

export class MakeAdapter {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  async executeWebhook(request: MakeWebhookRequest): Promise<Result<MakeWebhookResponse, Error>> {
    try {
      const validated = makeWebhookRequestSchema.parse(request);

      logger.info('[MakeAdapter] Ejecutando webhook', {
        webhookUrl: validated.webhookUrl,
        dataKeys: Object.keys(validated.data)
      });

      const response: AxiosResponse = await this.axiosInstance.post(
        validated.webhookUrl,
        validated.data,
        validated.headers ? { headers: validated.headers as Record<string, string> } : undefined
      );

      logger.info('[MakeAdapter] Webhook ejecutado con éxito', {
        webhookUrl: validated.webhookUrl,
        status: response.status
      });

      return ok({
        success: true,
        data: response.data,
        status: response.status,
        message: 'Webhook executed successfully'
      });
    } catch (e: unknown) {
      const error = e instanceof Error ? e : new Error(String(e));

      if (axios.isAxiosError(e)) {
        logger.error('[MakeAdapter] Error HTTP ejecutando webhook', {
          error: error.message,
          status: e.response?.status,
          statusText: e.response?.statusText
        });

        return err(
          new Error(`Webhook execution failed: ${e.response?.statusText ?? error.message}`)
        );
      }

      logger.error('[MakeAdapter] Error ejecutando webhook', {
        error: error.message
      });

      return err(error);
    }
  }
}

export const makeAdapter = new MakeAdapter();



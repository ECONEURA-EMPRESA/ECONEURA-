/**
 * ECONEURA - Environment Variables Provider
 * Provider para obtener secretos de variables de entorno
 */
import { getValidatedEnv } from '../../config/env';
import { logger } from '../../shared/logger';

export class EnvProvider {
  /**
   * Obtener secret de variable de entorno
   * Convierte nombres de secretos a formato de variable de entorno:
   * - "JWT-SECRET" -> "JWT_SECRET"
   * - "OPENAI-API-KEY" -> "OPENAI_API_KEY"
   */
  getSecret(secretName: string): string {
    const env = getValidatedEnv();
    
    // Convertir nombre de secret a formato de variable de entorno
    const envKey = secretName.replace(/-/g, '_').toUpperCase();
    
    // Intentar obtener de env validado
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envValue = (env as any)[envKey] as string | undefined;
    
    if (envValue && typeof envValue === 'string' && envValue.length > 0) {
      return envValue;
    }

    // Intentar obtener directamente de process.env (para variables no validadas)
    const processEnvValue = process.env[envKey];
    if (processEnvValue && typeof processEnvValue === 'string' && processEnvValue.length > 0) {
      logger.debug('[EnvProvider] Secret obtenido de process.env (no validado)', { secretName, envKey });
      return processEnvValue;
    }

    throw new Error(`Secret ${secretName} (${envKey}) no encontrado en variables de entorno`);
  }

  /**
   * Verificar si un secret existe en variables de entorno
   */
  hasSecret(secretName: string): boolean {
    try {
      this.getSecret(secretName);
      return true;
    } catch {
      return false;
    }
  }
}


/**
 * Log Sanitizer - Sanitiza información sensible antes de escribir logs
 * 
 * Elimina o enmascara información sensible como:
 * - correlationIds (pueden exponer estructura interna)
 * - userIds (privacidad)
 * - tenantIds (multi-tenancy)
 * - passwords, tokens, secrets
 * - IPs internas
 */

interface SanitizeOptions {
  /** Si true, elimina completamente los campos sensibles */
  removeSensitive?: boolean;
  /** Si true, enmascara valores en lugar de eliminarlos */
  maskValues?: boolean;
  /** Campos adicionales a sanitizar */
  additionalFields?: string[];
}

/**
 * Campos que contienen información sensible y deben ser sanitizados
 */
const SENSITIVE_FIELDS = [
  'correlationId',
  'userId',
  'tenantId',
  'user_id',
  'tenant_id',
  'correlation_id',
  'password',
  'secret',
  'token',
  'api_key',
  'apikey',
  'access_token',
  'refresh_token',
  'authorization',
  'auth',
  'credential',
  'private_key',
  'privateKey',
  'session_id',
  'sessionId',
  'cookie',
  'ip',
  'ip_address',
  'ipAddress',
  'remote_address',
  'remoteAddress'
] as const;

/**
 * Sanitiza un objeto eliminando o enmascarando campos sensibles
 */
export function sanitizeLogData(
  data: Record<string, unknown>,
  options: SanitizeOptions = {}
): Record<string, unknown> {
  const {
    removeSensitive = false,
    maskValues = true,
    additionalFields = []
  } = options;

  const allSensitiveFields = [...SENSITIVE_FIELDS, ...additionalFields];
  const sanitized = { ...data };

  for (const field of allSensitiveFields) {
    if (field in sanitized) {
      if (removeSensitive) {
        delete sanitized[field];
      } else if (maskValues) {
        const value = sanitized[field];
        if (typeof value === 'string' && value.length > 0) {
          // Enmascarar: mostrar primeros 2 y últimos 2 caracteres, resto con *
          if (value.length <= 4) {
            sanitized[field] = '****';
          } else {
            const start = value.substring(0, 2);
            const end = value.substring(value.length - 2);
            const masked = '*'.repeat(Math.max(4, value.length - 4));
            sanitized[field] = `${start}${masked}${end}`;
          }
        } else if (typeof value === 'number') {
          // Para números, solo mostrar últimos 2 dígitos
          const str = String(value);
          if (str.length > 2) {
            sanitized[field] = `***${str.substring(str.length - 2)}`;
          } else {
            sanitized[field] = '****';
          }
        } else {
          sanitized[field] = '[REDACTED]';
        }
      }
    }
  }

  // Sanitizar objetos anidados recursivamente
  for (const [key, value] of Object.entries(sanitized)) {
    if (value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Date)) {
      sanitized[key] = sanitizeLogData(value as Record<string, unknown>, options);
    }
  }

  return sanitized;
}

/**
 * Sanitiza un string que puede contener información sensible
 */
export function sanitizeLogMessage(message: string): string {
  // Eliminar posibles tokens, passwords, etc. del mensaje
  let sanitized = message;

  // Patrones comunes de información sensible
  const patterns = [
    /password[=:]\s*['"]?[^'"]+['"]?/gi,
    /token[=:]\s*['"]?[^'"]+['"]?/gi,
    /secret[=:]\s*['"]?[^'"]+['"]?/gi,
    /api[_-]?key[=:]\s*['"]?[^'"]+['"]?/gi,
    /authorization[=:]\s*['"]?[^'"]+['"]?/gi
  ];

  for (const pattern of patterns) {
    sanitized = sanitized.replace(pattern, (match) => {
      const parts = match.split(/[=:]/);
      if (parts.length === 2) {
        return `${parts[0]}: [REDACTED]`;
      }
      return '[REDACTED]';
    });
  }

  return sanitized;
}

/**
 * Sanitiza metadata antes de loguear
 * Esta es la función principal que debe usarse en el logger
 */
export function sanitizeMetadata(metadata: Record<string, unknown> | undefined): Record<string, unknown> {
  if (!metadata || typeof metadata !== 'object') {
    return {};
  }

  // En producción, sanitizar más agresivamente
  const isProduction = process.env['NODE_ENV'] === 'production';
  
  return sanitizeLogData(metadata, {
    removeSensitive: false, // Mantener campos pero enmascarados
    maskValues: true,
    additionalFields: isProduction ? ['ip', 'ipAddress', 'remoteAddress'] : []
  });
}



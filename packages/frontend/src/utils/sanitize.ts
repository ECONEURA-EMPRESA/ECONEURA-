/**
 * Utilidades de sanitización y validación de datos
 * Previene XSS y valida inputs del usuario
 */

/**
 * Sanitiza un string eliminando caracteres peligrosos
 * @param input - String a sanitizar
 * @returns String sanitizado
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .replace(/[<>]/g, '') // Elimina < y >
    .replace(/javascript:/gi, '') // Elimina javascript:
    .replace(/on\w+=/gi, '') // Elimina event handlers
    .slice(0, 1000); // Limita longitud
}

/**
 * Sanitiza una query de búsqueda
 * @param query - Query a sanitizar
 * @returns Query sanitizada
 */
export function sanitizeSearchQuery(query: string): string {
  return sanitizeString(query)
    .replace(/[^\w\s@.-]/g, '') // Solo permite letras, números, espacios, @, ., -
    .slice(0, 100); // Limita a 100 caracteres
}

/**
 * Valida un email
 * @param email - Email a validar
 * @returns true si es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida un número dentro de un rango
 * @param value - Valor a validar
 * @param min - Valor mínimo
 * @param max - Valor máximo
 * @returns Valor validado o null si es inválido
 */
export function validateNumberRange(
  value: number,
  min: number,
  max: number
): number | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return null;
  }
  return Math.max(min, Math.min(max, value));
}

/**
 * Escapa HTML para prevenir XSS
 * @param html - String con HTML
 * @returns String escapado
 */
export function escapeHtml(html: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return html.replace(/[&<>"']/g, (m) => map[m]);
}


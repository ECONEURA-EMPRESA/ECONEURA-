/**
 * Utilidades de color para ECONEURA
 */

/**
 * Convierte un color hexadecimal a RGB
 * @param hex - Color en formato hex (#RRGGBB o #RGB)
 * @returns Objeto con componentes r, g, b (0-255)
 * @example hexToRgb('#3b82f6') → { r: 59, g: 130, b: 246 }
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3 ? normalized.split('').map(x => x + x).join('') : normalized;
  const bigint = parseInt(expanded, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

/**
 * Convierte hex a rgba con opacidad
 * @param hex - Color en formato hex
 * @param alpha - Opacidad 0-1
 * @returns String rgba() para CSS
 * @example rgba('#3b82f6', 0.5) → 'rgba(59, 130, 246, 0.5)'
 */
export function rgba(hex: string, alpha: number): string {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * Aclara un color hex en X% (útil para dark mode)
 * @param hex - Color en formato hex
 * @param percent - Porcentaje a aclarar (0-100)
 * @returns Color hex aclarado
 * @example lightenColor('#3b82f6', 20) → '#5fa3f8'
 */
export function lightenColor(hex: string, percent: number): string {
  const { r, g, b } = hexToRgb(hex);
  const newR = Math.min(255, Math.round(r + (255 - r) * (percent / 100)));
  const newG = Math.min(255, Math.round(g + (255 - g) * (percent / 100)));
  const newB = Math.min(255, Math.round(b + (255 - b) * (percent / 100)));
  return `#${((1 << 24) + (newR << 16) + (newG << 8) + newB).toString(16).slice(1)}`;
}



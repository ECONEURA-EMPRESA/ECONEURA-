/**
 * Utility para combinar classNames condicionalmente
 * @param classes - Array de strings, booleans, null o undefined
 * @returns String con clases concatenadas
 * @example cx('base', isActive && 'active', 'other') → 'base active other'
 */
export function cx(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}



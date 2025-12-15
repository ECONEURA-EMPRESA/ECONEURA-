/**
 * Combina class names condicionalmente
 * @param strings - Array de class names
 * @returns String combinado de classes
 * @example
 * cx('base-class', isActive && 'active-class', 'another-class')
 * // Retorna: 'base-class active-class another-class' (si isActive es true)
 */
export const cx = (...strings: (string | boolean | undefined | null)[]) => {
    return strings.filter(Boolean).join(' ');
};

/**
 * Alias de cx para compatibilidad
 */
export const classNames = cx;

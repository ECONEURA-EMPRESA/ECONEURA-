/**
 * Utilidad para debounce de funciones
 * Útil para optimizar búsquedas y eventos frecuentes
 */

import { useState, useEffect } from 'react';

/**
 * Crea una función con debounce
 * @param func - Función a ejecutar después del delay
 * @param delay - Tiempo de espera en milisegundos
 * @returns Función con debounce aplicado
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return function debounced(...args: Parameters<T>) {
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

/**
 * Hook de React para usar debounce
 * @param value - Valor a debounce
 * @param delay - Tiempo de espera en milisegundos
 * @returns Valor debounced
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}


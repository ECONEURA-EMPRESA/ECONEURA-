import { useEffect, RefObject } from 'react';

/**
 * Hook para keyboard shortcuts
 * @param key - Tecla a detectar (ej: 'k')
 * @param callback - Función a ejecutar
 * @param ctrlOrMeta - Si requiere Ctrl (Windows) o Cmd (Mac)
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  ctrlOrMeta: boolean = false
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const matchesKey = e.key.toLowerCase() === key.toLowerCase();
      const matchesModifier = !ctrlOrMeta || (e.ctrlKey || e.metaKey);
      
      if (matchesKey && matchesModifier) {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, callback, ctrlOrMeta]);
}

/**
 * Hook para focus en input con Ctrl+K / Cmd+K
 * @param inputRef - Ref del input
 */
export function useSearchShortcut(inputRef: RefObject<HTMLInputElement>) {
  useKeyboardShortcut('k', () => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, true);
}



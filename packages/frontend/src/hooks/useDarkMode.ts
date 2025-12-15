import { useState } from 'react';

/**
 * Hook para gestionar dark mode con persistencia
 * @returns [darkMode, setDarkMode]
 */
export function useDarkMode(): [boolean, (value: boolean) => void] {
  const [darkMode, setDarkModeState] = useState(() => {
    // Leer de localStorage al iniciar
    if (typeof localStorage !== 'undefined') {
      const stored = localStorage.getItem('econeura_dark_mode');
      return stored === 'true';
    }
    return false;
  });

  const setDarkMode = (value: boolean) => {
    setDarkModeState(value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('econeura_dark_mode', String(value));
    }
  };

  return [darkMode, setDarkMode];
}



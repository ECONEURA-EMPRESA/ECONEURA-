import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';

export type ThemeMode = 'light' | 'dark' | 'system';
export type ThemeColor = 'blue' | 'emerald' | 'purple' | 'orange' | 'red' | 'teal';

export interface ThemeConfig {
  mode: ThemeMode;
  color: ThemeColor;
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    background?: string;
    surface?: string;
    text?: string;
  };
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
}

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
  applyTheme: () => void;
}

const defaultTheme: ThemeConfig = {
  mode: 'system',
  color: 'blue',
  animations: true,
  reducedMotion: false,
  highContrast: false
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeConfig>(() => {
    const saved = localStorage.getItem('econeura-theme');
    return saved ? { ...defaultTheme, ...JSON.parse(saved) } : defaultTheme;
  });

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    localStorage.setItem('econeura-theme', JSON.stringify(newTheme));
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    localStorage.removeItem('econeura-theme');
  };

  const applyTheme = () => {
    const root = document.documentElement;
    
    // Aplicar modo de tema
    if (theme.mode === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', systemPrefersDark);
    } else {
      root.classList.toggle('dark', theme.mode === 'dark');
    }

    // Aplicar colores del tema
    const colorPalettes = {
      blue: {
        primary: 'rgb(59, 130, 246)',
        secondary: 'rgb(147, 197, 253)',
        accent: 'rgb(30, 64, 175)',
        background: 'rgb(248, 250, 252)',
        surface: 'rgb(255, 255, 255)',
        text: 'rgb(15, 23, 42)'
      },
      emerald: {
        primary: 'rgb(16, 185, 129)',
        secondary: 'rgb(110, 231, 183)',
        accent: 'rgb(5, 150, 105)',
        background: 'rgb(236, 253, 245)',
        surface: 'rgb(255, 255, 255)',
        text: 'rgb(6, 78, 59)'
      },
      purple: {
        primary: 'rgb(147, 51, 234)',
        secondary: 'rgb(196, 181, 253)',
        accent: 'rgb(109, 40, 217)',
        background: 'rgb(250, 245, 255)',
        surface: 'rgb(255, 255, 255)',
        text: 'rgb(88, 28, 135)'
      },
      orange: {
        primary: 'rgb(249, 115, 22)',
        secondary: 'rgb(251, 191, 143)',
        accent: 'rgb(194, 65, 12)',
        background: 'rgb(255, 247, 237)',
        surface: 'rgb(255, 255, 255)',
        text: 'rgb(154, 52, 18)'
      },
      red: {
        primary: 'rgb(239, 68, 68)',
        secondary: 'rgb(252, 165, 165)',
        accent: 'rgb(185, 28, 28)',
        background: 'rgb(254, 242, 242)',
        surface: 'rgb(255, 255, 255)',
        text: 'rgb(153, 27, 27)'
      },
      teal: {
        primary: 'rgb(20, 184, 166)',
        secondary: 'rgb(94, 234, 212)',
        accent: 'rgb(13, 148, 136)',
        background: 'rgb(240, 253, 250)',
        surface: 'rgb(255, 255, 255)',
        text: 'rgb(19, 78, 74)'
      }
    };

    const palette = colorPalettes[theme.color];
    const colors = theme.customColors ? { ...palette, ...theme.customColors } : palette;

    // Aplicar variables CSS
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Aplicar configuraciones de accesibilidad
    root.classList.toggle('no-animations', !theme.animations);
    root.classList.toggle('reduced-motion', theme.reducedMotion);
    root.classList.toggle('high-contrast', theme.highContrast);
  };

  useEffect(() => {
    applyTheme();
  }, [theme]);

  useEffect(() => {
    // Escuchar cambios en preferencias del sistema
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme.mode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme.mode]);

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme, applyTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Componente de selector de tema
export function ThemeSelector() {
  const { theme, updateTheme } = useTheme();

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold">Configuración de Tema</h3>
      </div>

      {/* Modo de tema */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-2">Modo</label>
          <div className="flex gap-2">
            {[
              { value: 'light', icon: Sun, label: 'Claro' },
              { value: 'dark', icon: Moon, label: 'Oscuro' },
              { value: 'system', icon: Monitor, label: 'Sistema' }
            ].map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                onClick={() => updateTheme({ mode: value as ThemeMode })}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  theme.mode === value
                    ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
                    : 'border-gray-300 hover:border-gray-400 dark:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Color del tema */}
        <div>
          <label className="block text-sm font-medium mb-2">Color</label>
          <div className="flex gap-2">
            {(['blue', 'emerald', 'purple', 'orange', 'red', 'teal'] as ThemeColor[]).map(color => (
              <button
                key={color}
                onClick={() => updateTheme({ color })}
                className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  theme.color === color
                    ? 'border-gray-800 dark:border-white'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                style={{
                  backgroundColor: `var(--color-${color}-500, rgb(59, 130, 246))`
                }}
                title={color.charAt(0).toUpperCase() + color.slice(1)}
              />
            ))}
          </div>
        </div>

        {/* Configuraciones de accesibilidad */}
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={theme.animations}
              onChange={(e) => updateTheme({ animations: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Animaciones</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={theme.reducedMotion}
              onChange={(e) => updateTheme({ reducedMotion: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Movimiento reducido</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={theme.highContrast}
              onChange={(e) => updateTheme({ highContrast: e.target.checked })}
              className="rounded"
            />
            <span className="text-sm">Alto contraste</span>
          </label>
        </div>

        {/* Colores personalizados */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">Colores Personalizados</label>
          <div className="grid grid-cols-2 gap-2">
            {['primary', 'secondary', 'accent'].map(colorKey => (
              <div key={colorKey} className="space-y-1">
                <label className="text-xs text-gray-600 dark:text-gray-400">
                  {colorKey.charAt(0).toUpperCase() + colorKey.slice(1)}
                </label>
                <input
                  type="color"
                  value={theme.customColors?.[colorKey as keyof typeof theme.customColors] || ''}
                  onChange={(e) => updateTheme({
                    customColors: {
                      ...theme.customColors,
                      [colorKey]: e.target.value
                    }
                  })}
                  className="w-full h-8 rounded border border-gray-300 dark:border-gray-600"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook para colores del tema actual
export function useThemeColors() {
  const { theme } = useTheme();
  
  const getColor = (colorName: string) => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(`--color-${colorName}`)
      .trim() || '';
  };

  return {
    primary: getColor('primary'),
    secondary: getColor('secondary'),
    accent: getColor('accent'),
    background: getColor('background'),
    surface: getColor('surface'),
    text: getColor('text'),
    isDark: theme.mode === 'dark' || (theme.mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  };
}

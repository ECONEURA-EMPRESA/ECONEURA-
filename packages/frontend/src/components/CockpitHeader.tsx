/**
 * Componente Header del Cockpit - Extraído para mejor organización
 */
import React, { memo } from 'react';
import { Menu, Moon, Sun, LogOut, Settings } from 'lucide-react';
import { LogoEconeura } from './LogoEconeura';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (value: boolean) => void;
  onLogout?: () => void;
}

export const CockpitHeader = memo(function CockpitHeader({
  darkMode,
  setDarkMode,
  sidebarOpen,
  setSidebarOpen,
  settingsOpen,
  setSettingsOpen,
  onLogout
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <LogoEconeura />
          <div>
            <h1 className="text-xl font-bold text-slate-900">ECONEURA</h1>
            <p className="text-sm text-slate-600">Cockpit Premium</p>
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title={darkMode ? 'Modo claro' : 'Modo oscuro'}
          >
            {darkMode ? <Sun className="w-5 h-5 text-slate-600" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            title="Configuración"
          >
            <Settings className="w-5 h-5 text-slate-600" />
          </button>

          {onLogout && (
            <button
              onClick={onLogout}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5 text-slate-600" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
});

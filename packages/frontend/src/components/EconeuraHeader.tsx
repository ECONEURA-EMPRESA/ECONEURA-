import React from 'react';
import { Settings, Menu, X } from 'lucide-react';

interface EconeuraHeaderProps {
  isDarkMode: boolean;
  onToggleSettings: () => void;
  onToggleMenu: () => void;
  isMenuOpen: boolean;
}

export function EconeuraHeader({
  isDarkMode: _isDarkMode,
  onToggleSettings,
  onToggleMenu,
  isMenuOpen
}: EconeuraHeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-slate-200/40 dark:border-gray-700/40">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo ECONEURA */}
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-full flex items-center justify-center transform transition-transform duration-300 hover:scale-105">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent dark:from-white dark:to-gray-300">
                ECONEURA
              </h1>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                Cockpit Premium
              </p>
            </div>
          </div>

          {/* Controles del header */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMenu}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200"
              title="Menú"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-slate-600 dark:text-gray-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-600 dark:text-gray-300" />
              )}
            </button>

            <button
              onClick={onToggleSettings}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200"
              title="Configuración"
            >
              <Settings className="w-5 h-5 text-slate-600 dark:text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

import React, { memo } from 'react';
import { Search, Settings, Menu, Moon, Sun } from 'lucide-react';
import { cx } from '../utils/classnames';

interface TopBarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  onMenuToggle: () => void;
  onSettingsOpen: () => void;
  showMobileMenu: boolean;
  showMobileSearch: boolean;
  logoComponent: React.ReactNode;
}

/**
 * TopBar Component - Barra superior del Cockpit
 * Memoizado para evitar re-renders innecesarios
 */
export const TopBar = memo(function TopBar({
  darkMode,
  onToggleDarkMode,
  searchQuery,
  onSearchChange,
  searchInputRef,
  onMenuToggle,
  onSettingsOpen,
  showMobileMenu,
  showMobileSearch,
  logoComponent
}: TopBarProps) {
  return (
    <header
      className={cx(
        "sticky top-0 z-30 px-4 md:px-8 py-4 md:py-5 flex items-center justify-between gap-3 md:gap-6 border-b transition-colors",
        darkMode
          ? "bg-[#0d1117] border-slate-800"
          : "bg-gradient-to-r from-white via-slate-50/80 to-white border-slate-200/60"
      )}
      style={{
        boxShadow: darkMode
          ? "0 4px 16px rgba(0, 0, 0, 0.2), 0 1px 4px rgba(0, 0, 0, 0.15)"
          : "0 2px 12px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02), inset 0 -1px 0 rgba(255, 255, 255, 0.5)"
      }}
    >
      {/* Logo + Hamburger */}
      <div className="flex items-center gap-3 md:gap-5">
        <button
          onClick={onMenuToggle}
          className={cx(
            "md:hidden p-2 rounded-lg transition-colors",
            darkMode ? "hover:bg-slate-700" : "hover:bg-slate-100"
          )}
          aria-label={showMobileMenu ? "Cerrar menú" : "Abrir menú"}
        >
          <Menu className="w-5 h-5" />
        </button>

        {logoComponent}
      </div>

      {/* Search Bar */}
      {showMobileSearch && (
        <div className={cx(
          "flex-1 max-w-md hidden md:flex items-center gap-3 px-4 py-2.5 rounded-xl border-2 transition-all",
          darkMode
            ? "bg-[#161b22] border-slate-700/60 hover:border-slate-600 focus-within:border-emerald-500"
            : "bg-white border-slate-200/80 hover:border-slate-300 focus-within:border-emerald-500"
        )}
          style={{
            boxShadow: darkMode
              ? "0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.02)"
              : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)"
          }}
        >
          <Search className={cx("w-5 h-5", darkMode ? "text-slate-500" : "text-slate-400")} />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Buscar agentes... (Ctrl+K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className={cx(
              "flex-1 bg-transparent border-none outline-none text-sm font-medium",
              darkMode ? "text-slate-200 placeholder-slate-500" : "text-slate-700 placeholder-slate-400"
            )}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className={cx(
            "p-2.5 rounded-xl transition-all",
            darkMode
              ? "bg-slate-800 hover:bg-slate-700 text-yellow-400"
              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
          )}
          aria-label={darkMode ? "Modo claro" : "Modo oscuro"}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Settings */}
        <button
          onClick={onSettingsOpen}
          className={cx(
            "p-2.5 rounded-xl transition-all",
            darkMode
              ? "bg-gradient-to-br from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700"
              : "bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300"
          )}
          style={{
            boxShadow: darkMode
              ? "0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.03), inset 0 0 0 1px rgba(100, 116, 139, 0.1)"
              : "0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8), inset 0 0 0 1px rgba(148, 163, 184, 0.1)"
          }}
          aria-label="Configuración"
        >
          <Settings className={cx("w-5 h-5", darkMode ? "text-slate-300" : "text-slate-600")} />
        </button>
      </div>
    </header>
  );
});


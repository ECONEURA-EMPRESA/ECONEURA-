import React from 'react';
import { X, ListChecks } from 'lucide-react';
import { cx } from '../utils/classnames';
import { DepartmentButton } from './DepartmentButton';
import { NEURA_DATA as DATA, getDeptIcon, getPalette } from '../data/neuraData';

interface DepartmentSelectorProps {
    sidebarOpen: boolean;
    setSidebarOpen: (open: boolean) => void;
    darkMode: boolean;
    activeDept: string;
    setActiveDept: (id: string) => void;
    orgView: boolean;
    setOrgView: (view: boolean) => void;
}

export function DepartmentSelector({
    sidebarOpen,
    setSidebarOpen,
    darkMode,
    activeDept,
    setActiveDept,
    orgView,
    setOrgView
}: DepartmentSelectorProps) {
    return (
        <>
            {/* Overlay oscuro en móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar Premium - Overlay en móvil, fijo en desktop */}
            <aside
                className={`fixed md:relative inset-y-0 left-0 w-80 border-r p-5 space-y-2 flex-col z-50 transition-transform duration-300 ${sidebarOpen ? 'flex translate-x-0' : 'hidden md:flex md:translate-x-0 -translate-x-full'
                    } ${darkMode
                        ? 'bg-[#161b22] border-slate-800'
                        : 'bg-gradient-to-br from-slate-50 via-white to-slate-50/80 border-slate-200/60'
                    }`}
                style={{
                    boxShadow: darkMode
                        ? '2px 0 16px rgba(0, 0, 0, 0.25), 1px 0 4px rgba(0, 0, 0, 0.15)'
                        : '2px 0 12px rgba(0, 0, 0, 0.04), 1px 0 4px rgba(0, 0, 0, 0.02), inset -1px 0 0 rgba(255, 255, 255, 0.5)',
                    transformStyle: 'preserve-3d'
                }}
            >
                {/* Botón cerrar sidebar - Solo móvil */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className={`md:hidden self-end p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                        }`}
                    aria-label="Cerrar menú"
                >
                    <X className="w-5 h-5" />
                </button>

                {DATA.map(d => (
                    <DepartmentButton
                        key={d.id}
                        dept={d}
                        isActive={activeDept === d.id && !orgView}
                        icon={getDeptIcon(d.id) as React.ComponentType<any>}
                        palette={getPalette(d.id)}
                        darkMode={darkMode}
                        onClick={() => { setActiveDept(d.id); setOrgView(false); }}
                    />
                ))}
                <div className={`mt-3 border-t pt-3 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                    <button
                        onClick={() => setOrgView(true)}
                        className={cx(
                            "w-full text-left px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all",
                            orgView
                                ? darkMode
                                    ? "bg-emerald-500/10 text-emerald-400 font-semibold shadow-md border-l-4 border-emerald-500"
                                    : "bg-gradient-to-r from-sky-100 to-blue-100 text-slate-900 font-semibold shadow-md"
                                : darkMode
                                    ? "text-slate-400 hover:bg-slate-800/50 hover:text-slate-300"
                                    : "text-slate-700 hover:bg-slate-50"
                        )}
                    >
                        <ListChecks className="w-5 h-5" />
                        <span>Organigrama</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

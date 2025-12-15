/**
 * OrgChart - Vista de organigrama de departamentos
 * Extraído de EconeuraCockpit.tsx para mejor mantenibilidad
 */
import React from 'react';
import { Brain } from 'lucide-react';
import { NEURA_DATA as DATA, getDeptIcon, getPalette, type Department, type Agent } from '../../data/neuraData';
import { hexToRgb, rgba } from '../../utils/colors';

export function OrgChart(): React.ReactElement {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {DATA.map((d: Department) => {
                const Icon = getDeptIcon(d.id);
                const p = getPalette(d.id);
                const { r, g, b } = hexToRgb(p.textHex);
                return (
                    <div
                        key={d.id}
                        className="group relative bg-white border border-slate-200/80 rounded-2xl p-6 hover:-translate-y-2 transition-all duration-300"
                        style={{
                            transform: 'perspective(1200px) rotateX(2deg)',
                            transformStyle: 'preserve-3d',
                            boxShadow: `0 12px 32px rgba(${r}, ${g}, ${b}, 0.15), 0 6px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
                        }}
                    >
                        {/* Efecto 3D overlay mejorado */}
                        <div
                            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-slate-50/20 pointer-events-none group-hover:from-white/40 transition-all duration-300"
                            style={{ transform: 'translateZ(2px)' }}
                        />

                        {/* Borde inferior 3D */}
                        <div
                            className="absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200/50 to-transparent"
                            style={{ transform: 'translateZ(-1px)' }}
                        />

                        {/* Header del departamento */}
                        <div
                            className="flex items-start justify-between mb-5 relative"
                            style={{ transform: 'translateZ(2px)' }}
                        >
                            <div className="flex items-start gap-3 flex-1">
                                <div
                                    className="p-3 rounded-xl border border-slate-200/60 shadow-lg group-hover:scale-110 transition-all duration-300"
                                    style={{
                                        backgroundColor: rgba(p.textHex, 0.1),
                                        boxShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.2)`
                                    }}
                                >
                                    {React.createElement(Icon, {
                                        className: 'w-6 h-6',
                                        style: { color: p.textHex }
                                    })}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="font-bold text-base text-slate-900 leading-tight">
                                        {d.name}
                                    </div>
                                    <div
                                        className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-semibold mt-2 border shadow-sm"
                                        style={{
                                            backgroundColor: rgba(p.textHex, 0.1),
                                            color: p.textHex,
                                            borderColor: rgba(p.textHex, 0.2)
                                        }}
                                    >
                                        <Brain className="w-3.5 h-3.5" />
                                        NEURA
                                    </div>
                                </div>
                            </div>
                            <span
                                className="text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap border-2 shadow-md"
                                style={{
                                    backgroundColor: rgba(p.textHex, 0.1),
                                    color: p.textHex,
                                    borderColor: rgba(p.textHex, 0.3)
                                }}
                            >
                                {d.agents.length}
                            </span>
                        </div>

                        {/* Lista de agentes con efecto 3D */}
                        <ul
                            className="text-sm text-slate-700 space-y-2 mb-5 relative"
                            style={{ transform: 'translateZ(2px)' }}
                        >
                            <li className="flex items-start gap-2.5 font-bold">
                                <span
                                    className="mt-1.5 w-2 h-2 rounded-full shadow-md"
                                    style={{
                                        backgroundColor: p.textHex,
                                        boxShadow: `0 0 8px rgba(${r}, ${g}, ${b}, 0.4)`
                                    }}
                                />
                                <span style={{ color: p.textHex }}>{d.neura.title}</span>
                            </li>
                            {d.agents.slice(0, 4).map((a: Agent) => (
                                <li
                                    key={a.id}
                                    className="flex items-start gap-2.5 text-xs hover:translate-x-1 transition-transform duration-200"
                                >
                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-sm" />
                                    <span className="text-slate-600">{a.title}</span>
                                </li>
                            ))}
                            {d.agents.length > 4 && (
                                <li className="text-xs text-slate-500 pl-4 font-medium">
                                    + {d.agents.length - 4} agentes más
                                </li>
                            )}
                        </ul>

                        {/* Footer con tags premium */}
                        <div
                            className="flex gap-2 flex-wrap pt-4 border-t-2 border-slate-200/50 relative"
                            style={{ transform: 'translateZ(2px)' }}
                        >
                            {d.neura.tags.slice(0, 3).map((tag: string, i: number) => (
                                <span
                                    key={i}
                                    className="text-xs px-3 py-1.5 rounded-lg font-semibold shadow-sm border hover:scale-105 transition-all duration-200"
                                    style={{
                                        backgroundColor: rgba(p.textHex, 0.08),
                                        color: rgba(p.textHex, 0.9),
                                        borderColor: rgba(p.textHex, 0.2)
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default OrgChart;

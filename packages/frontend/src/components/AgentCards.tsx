
import React, { memo } from 'react';
import { Play, Pause, Settings, Workflow } from 'lucide-react';
import { iconForAgent } from '../data/neuraData';
import { cx } from '../utils/classnames';
import type { Agent } from '../types';

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
}

type AgentCardProps = { a: Agent; deptColor: string; busy?: boolean; progress?: number; showUsage?: boolean; onRun: () => Promise<any> | void; onConfigure: () => void };

export const AgentCard = memo(function AgentCard({ a, deptColor, busy, progress, showUsage, onRun, onConfigure }: AgentCardProps) {
    const pct = Math.max(0, Math.min(100, (progress ?? 11)));
    const I: React.ElementType = iconForAgent(a.title);
    const { r, g, b } = hexToRgb(deptColor);

    return (
        <div className="group relative w-full max-w-full md:max-w-[580px] bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/60 rounded-2xl p-4 md:p-8 flex flex-col shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-400/30 hover:-translate-y-2 transition-all duration-500" style={{
            transform: 'perspective(1000px) rotateX(0deg)',
            transformStyle: 'preserve-3d'
        }}>
            {/* Efecto 3D sutil */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" style={{ transform: 'translateZ(1px)' }}></div>

            <div className="flex items-start justify-between gap-3 mb-4 relative" style={{ transform: 'translateZ(2px)' }}>
                <div className="flex items-start gap-3 flex-1">
                    <div
                        className="mt-0.5 p-2.5 rounded-xl border border-slate-200/60 group-hover:scale-105 transition-all duration-200 shadow-md"
                        style={{
                            backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
                            boxShadow: `0 4px 12px rgba(${r}, ${g}, ${b}, 0.15)`
                        }}
                    >
                        {React.createElement(I, { className: "w-5 h-5", style: { color: deptColor } })}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-base font-semibold text-slate-900 leading-tight">{a.title}</div>
                        <div className="text-sm text-slate-600 mt-2 leading-relaxed">{a.desc}</div>
                    </div>
                </div>
                <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium whitespace-nowrap shadow-sm">
                    ✅
                </span>
                <button
                    onClick={onConfigure}
                    className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm hover:shadow-md"
                    aria-label="Configurar agente"
                    title="Conectar con Make, n8n o ChatGPT"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            {showUsage && (
                a.pills && a.pills.length ? (
                    <div className="mb-4 text-xs text-slate-700 flex gap-2 flex-wrap relative" style={{ transform: 'translateZ(2px)' }}>
                        {a.pills.map((p: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 font-medium shadow-sm">{p}</span>
                        ))}
                    </div>
                ) : (
                    <div className="mb-4 text-xs text-slate-500 font-medium">Consumo: N/D</div>
                )
            )}

            <div className="mb-5 relative" style={{ transform: 'translateZ(2px)' }}>
                <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200/60">
                    <div
                        className="absolute inset-y-0 left-0 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{
                            width: `${pct}%`,
                            minWidth: pct > 0 ? '8px' : '0px',
                            background: `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 0.7), rgba(${r}, ${g}, ${b}, 0.9))`,
                            boxShadow: `0 0 10px rgba(${r}, ${g}, ${b}, 0.3)`
                        }}
                    />
                </div>
                <div className="mt-2.5 text-sm text-slate-600 font-medium">{pct}% completado</div>
            </div>

            <div className="flex gap-3 relative" style={{ transform: 'translateZ(3px)' }}>
                <button
                    onClick={() => onRun()}
                    disabled={!!busy}
                    className={cx("w-[230px] h-11 px-5 rounded-xl text-base font-semibold transition-shadow duration-200 active:scale-95 inline-flex items-center justify-center gap-2 shrink-0 relative",
                        busy
                            ? "opacity-60 cursor-not-allowed bg-slate-100 text-slate-500 border border-slate-200/60"
                            : "text-white shadow-lg hover:shadow-2xl border-0"
                    )}
                    style={!busy ? {
                        background: `linear-gradient(135deg, rgb(${r}, ${g}, ${b}), rgb(${Math.floor(r * 0.9)}, ${Math.floor(g * 0.9)}, ${Math.floor(b * 0.9)}))`,
                        boxShadow: `0 6px 20px rgba(${r}, ${g}, ${b}, 0.35), 0 2px 8px rgba(${r}, ${g}, ${b}, 0.2)`,
                        width: '230px'
                    } : { width: '230px' }}>
                    {busy ? (
                        <>
                            <span className="animate-spin text-base">⏳</span>
                            <span>Ejecutando</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-5 h-5" />
                            <span>Ejecutar</span>
                        </>
                    )}
                </button>
                <button className="h-11 w-11 shrink-0 rounded-xl border border-slate-200/60 text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center">
                    <Pause className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
});

type NewAgentCardProps = { deptId: string; deptColor: string; onCreate: (deptId: string) => void };

export function NewAgentCard({ deptId, deptColor, onCreate }: NewAgentCardProps) {
    const { r, g, b } = hexToRgb(deptColor);

    const handleCreate = () => {
        const name = prompt('Nombre del nuevo agente:');
        if (name) {
            alert(`Creando agente "${name}" para ${deptId}...\n\n(En producción esto se guardaría en la base de datos)`);
            onCreate(deptId);
        }
    };

    return (
        <div
            className="group relative w-full max-w-[580px] bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-2xl hover:border-solid hover:-translate-y-2 transition-all duration-500"
            style={{
                transform: 'perspective(1000px) rotateX(0deg)',
                transformStyle: 'preserve-3d'
            }}
        >
            <div
                className="p-2.5 rounded-xl border border-slate-200/60 shadow-md group-hover:scale-110 transition-all duration-300"
                style={{
                    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
                    boxShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.15)`
                }}
            >
                <Workflow className="w-5 h-5" style={{ color: deptColor }} />
            </div>

            <div className="text-center">
                <div className="text-base font-bold text-slate-900">Nuevo Agente</div>
                <div className="text-sm text-slate-600 mt-1">Crear agente personalizado</div>
            </div>

            <button
                onClick={handleCreate}
                className="w-full h-11 rounded-xl text-base font-semibold text-white shadow-md hover:shadow-lg hover:scale-102 transition-all duration-200 border border-slate-200/60"
                style={{
                    background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.75), rgba(${r}, ${g}, ${b}, 0.9))`,
                    boxShadow: `0 4px 12px rgba(${r}, ${g}, ${b}, 0.25)`
                }}
            >
                + Crear
            </button>
        </div>
    );
}

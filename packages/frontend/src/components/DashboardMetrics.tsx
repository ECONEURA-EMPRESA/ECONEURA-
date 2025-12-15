import React from 'react';
import { Brain, MessageCircle, UserCheck, ShieldCheck, Zap } from 'lucide-react';
import { cx } from '../utils/classnames';
import { rgba } from '../utils/colors';
import { Department, TagIcon, getDeptIcon, getPalette } from '../data/neuraData';

interface DashboardMetricsProps {
    dept: Department;
    darkMode?: boolean;
    palette?: { textHex: string; bgHex: string; accentText: string };
    setChatOpen?: (open: boolean) => void;
    setPortalOpen?: (open: boolean) => void;
    setAgentExecutionOpen?: (open: boolean) => void;
}

export function DashboardMetrics({ dept, darkMode, palette, setChatOpen, setPortalOpen, setAgentExecutionOpen }: DashboardMetricsProps) {
    const pal = palette || getPalette(dept.id);
    const DeptIconComp = getDeptIcon(dept.id);

    return (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-4">
                    <div
                        className="p-2.5 rounded-lg border transition-colors"
                        style={{
                            backgroundColor: rgba(pal.textHex, 0.06),
                            borderColor: rgba(pal.textHex, 0.15)
                        }}
                    >
                        {React.createElement(DeptIconComp, {
                            className: "w-6 h-6",
                            style: { color: pal.textHex }
                        })}
                    </div>
                    <div>
                        <div className="text-xl font-semibold text-slate-900">{dept.name}</div>
                        <div className="flex items-center gap-2 mt-1.5">
                            <span
                                className="text-[10px] px-2.5 py-1 rounded-md font-medium"
                                style={{
                                    backgroundColor: rgba(pal.textHex, 0.08),
                                    color: pal.textHex,
                                    border: `1px solid ${rgba(pal.textHex, 0.15)}`
                                }}
                            >
                                {dept.agents.length} agentes
                            </span>
                            {dept.chips.map((c: string, i: number) => (
                                <span
                                    key={i}
                                    className={cx(
                                        "text-[10px] px-2.5 py-1 rounded-md border inline-flex items-center gap-1 font-medium",
                                        c.toLowerCase().includes('hitl')
                                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                    )}
                                >
                                    {c.toLowerCase().includes('hitl') ? <UserCheck className="w-3 h-3" /> : <ShieldCheck className="w-3 h-3" />}
                                    {c}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-200 pt-6 mt-6">
                <div
                    className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-base font-semibold mb-3 border border-slate-300 shadow-sm"
                    style={{
                        backgroundColor: rgba(pal.textHex, 0.1),
                        color: pal.textHex
                    }}
                >
                    <Brain className="w-5 h-5" />
                    {dept.neura.title}
                </div>
                <div className="text-sm text-slate-700 leading-relaxed font-medium mb-5">{dept.neura.subtitle}</div>

                <div className="mt-5 flex gap-2.5 flex-wrap">
                    {dept.neura.tags.map((t: string, i: number) => (
                        <button
                            key={i}
                            className="text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 transition-all inline-flex items-center gap-2 font-medium shadow-sm hover:shadow-md hover:scale-102"
                            style={{
                                color: pal.textHex
                            }}
                        >
                            <TagIcon text={t} />
                            {t}
                        </button>
                    ))}
                </div>

                <div className="mt-6 flex gap-3">
                    <button
                        className="h-10 px-5 rounded-lg border border-slate-300 text-white inline-flex items-center gap-2 text-sm font-semibold hover:scale-102 transition-all shadow-sm hover:shadow-md"
                        style={{
                            backgroundColor: pal.textHex,
                            opacity: 0.9
                        }}
                        onClick={() => setChatOpen?.(true)}
                    >
                        <MessageCircle className="w-4 h-4" />
                        Abrir chat
                    </button>
                    <button
                        onClick={() => setPortalOpen?.(true)}
                        className="h-9 px-4 rounded-lg border border-slate-200 bg-white inline-flex items-center gap-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                        Portal Cliente
                    </button>
                    <button
                        onClick={() => setAgentExecutionOpen?.(true)}
                        className="h-9 px-4 rounded-lg border border-emerald-200 bg-emerald-50 inline-flex items-center gap-2 text-xs font-medium text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                        <Zap className="w-4 h-4" />
                        Ejecutar Agentes
                    </button>
                </div>
            </div>
        </div>
    );
}

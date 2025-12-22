import React from "react";
import { FileText, Volume2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cx } from "../../../utils/classnames";
import { ReferencesBlock } from "../../../components/ReferencesBlock"; // Still external for now, but referenced via path
import { ChatMessage } from "../types";

interface ChatMessageItemProps {
    message: ChatMessage;
    darkMode: boolean;
    voiceSupported?: boolean;
    onSpeak?: (text: string) => void;
    idx: number;
}

export function ChatMessageItem({ message: m, darkMode, voiceSupported, onSpeak, idx }: ChatMessageItemProps) {
    return (
        <div className={cx("flex flex-col gap-2", m.role === 'user' ? 'items-end' : 'items-start')}
            style={{ animation: `fadeInUp 0.5s ease-out forwards ${idx * 40}ms` }}>

            {/* Function Badge */}
            {m.role === 'assistant' && m.function_call && (
                <div className="flex items-center gap-2 px-3 py-1 mb-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
                        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
                            {m.function_call.name === 'ejecutar_webhook' ? '⚡ Agente Ejecutado' :
                                m.function_call.name === 'agendar_reunion' ? '📅 Reunión Agendada' :
                                    m.function_call.name === 'consultar_datos' ? '📊 Datos Consultados' :
                                        m.function_call.name === 'enviar_alerta' ? '🚨 Alerta Enviada' :
                                            m.function_call.name === 'generar_reporte' ? '📄 Reporte Generando' :
                                                m.function_call.name === 'listar_agentes_disponibles' ? '📋 Agentes Listados' : '🔧 Función'}
                        </span>
                        {m.function_call.hitl_required && (
                            <span className="text-[9px] font-bold text-amber-400">⚠ HITL</span>
                        )}
                    </div>
                </div>
            )}

            {/* Message Bubble */}
            <div
                className={cx(
                    "max-w-[80%] rounded-3xl px-6 py-5 text-sm transition-all duration-300 hover:scale-[1.02] group relative overflow-hidden",
                    m.role === 'user'
                        ? darkMode ? 'bg-slate-700 text-white shadow-lg' : 'bg-slate-900 text-white shadow-lg'
                        : darkMode ? 'bg-white/10 text-slate-100 border border-white/20 shadow-lg' : 'bg-white text-slate-900 border-2 border-slate-300 shadow-lg'
                )}
                style={{ transform: 'perspective(1000px) translateZ(0)', transformStyle: 'preserve-3d' }}
            >
                <div className="leading-relaxed relative z-10 prose prose-sm max-w-none prose-slate" style={{ color: m.role === 'assistant' ? '#000000' : 'inherit' }}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.text}</ReactMarkdown>
                </div>
            </div>

            {/* References */}
            {m.role === 'assistant' && m.references && m.references.length > 0 && (
                <div className="w-full">
                    <ReferencesBlock references={m.references} darkMode={!darkMode} />
                </div>
            )}

            {/* Metadata & Actions */}
            <div className="flex items-center gap-3 px-2">
                {m.role === 'assistant' && (m.tokens ?? 0) > 0 && (
                    <span className="text-[10px] text-slate-400 font-mono">{m.tokens} tokens</span>
                )}
                {m.role === 'assistant' && m.function_call && (
                    <span className="text-[10px] font-semibold text-slate-700 px-2 py-0.5 bg-slate-100 rounded">
                        {m.function_call.status === 'executed' ? '✅ Ejecutado' : '❌ Falló'}
                    </span>
                )}
                {m.role === 'assistant' && (
                    <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-lg hover:bg-slate-100 transition-all group" title="Copiar">
                            <FileText className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                        </button>
                        {voiceSupported && (
                            <button onClick={() => voiceSupported && onSpeak?.(m.text)} className="p-1.5 rounded-lg hover:bg-slate-100 transition-all group" title="Escuchar">
                                <Volume2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

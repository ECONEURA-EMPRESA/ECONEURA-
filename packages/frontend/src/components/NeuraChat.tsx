import React, { useRef, useEffect } from "react";
import {
    X, Brain, FileText, Volume2, Loader, Mic, MicOff, Send, Paperclip
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cx } from "../utils/classnames";
import { ReferencesBlock } from "./ReferencesBlock";
import { Department, getDeptIcon, getPalette } from "../data/neuraData";
import { AgentExecutionPanel } from "./AgentExecutionPanel";

export interface ChatMessage {
    id: string;
    text: string;
    role: 'user' | 'assistant';
    model?: string;
    tokens?: number;
    reasoning_tokens?: number;
    cost?: number;
    references?: Array<{ index: number; docId: string; title: string; pages: string; preview: string }>;
    function_call?: {
        name: string;
        arguments: Record<string, unknown>;
        status?: string;
        result?: { message?: string };
        hitl_required?: boolean;
    };
}

export interface PendingAttachment {
    fileId: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    type: 'image' | 'file';
}

interface NeuraChatProps {
    isOpen?: boolean;
    onClose?: () => void;
    dept?: Department;
    deptId?: string;
    messages: ChatMessage[];
    input: string;
    setInput: (val: string) => void;
    onSend: () => void;
    isLoading: boolean;
    pendingAttachment: PendingAttachment | null;
    onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onAttachmentUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isUploading?: boolean;
    isUploadingAttachment?: boolean;
    onRemoveAttachment: () => void;
    onSuggestionClick?: (sug: any) => void;
    darkMode: boolean;
    voiceSupported?: boolean;
    listening?: boolean;
    onToggleListen?: () => void;
    onSpeak?: (text: string) => void;
    agentExecutionOpen?: boolean;
    onCloseAgentExecution?: () => void;
}

export function NeuraChat({
    isOpen,
    onClose,
    dept,
    deptId,
    messages,
    input,
    setInput,
    onSend,
    isLoading,
    pendingAttachment,
    onUpload,
    onAttachmentUpload,
    isUploading,
    isUploadingAttachment,
    onRemoveAttachment,
    onSuggestionClick,
    darkMode,
    voiceSupported,
    listening,
    onToggleListen,
    onSpeak,
    agentExecutionOpen,
    onCloseAgentExecution
}: NeuraChatProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, isOpen]);

    if (!isOpen) return null;

    // Get dept from deptId if dept not provided
    const actualDept = dept || (deptId ? { id: deptId, name: '', agents: [], chips: [], neura: { title: '', subtitle: '', tags: [], value: undefined } } as Department : undefined);
    const DeptIconComp = actualDept ? getDeptIcon(actualDept.id) : Brain;
    const pal = actualDept ? getPalette(actualDept.id) : { textHex: '#000', bgHex: '#fff', accentText: '#000' };

    return (
        <div className="fixed inset-0 bg-black/5 z-50 animate-fadeIn" onClick={onClose}>
            <aside
                className="absolute right-0 top-0 h-full w-full md:w-[1160px] bg-white overflow-hidden flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{
                    transform: 'perspective(2000px) rotateY(-1deg)',
                    transformStyle: 'preserve-3d',
                    boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.12), -10px 0 30px rgba(0, 0, 0, 0.08), inset 1px 0 0 rgba(255, 255, 255, 0.5)',
                    animation: 'slideInRightPremium 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200/40 px-8 py-5 z-20">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/20 to-transparent opacity-50"></div>
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                {React.createElement(DeptIconComp, {
                                    className: "w-6 h-6 relative z-10",
                                    style: { color: pal.textHex }
                                })}
                                <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-full" style={{ backgroundColor: pal.textHex }}></div>
                            </div>
                            <div>
                                <div className="text-base font-semibold text-slate-900">{actualDept?.neura.title || 'NEURA'}</div>
                                <div className="flex items-center gap-2 text-xs font-medium">
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-300">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                                        <span className="text-slate-900 font-semibold text-[11px]">Gemini 3 Pro</span>
                                    </span>
                                    <span className="text-slate-400">·</span>
                                    <span className="text-slate-600 text-[10px] font-medium">Google DeepMind</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                                title="Cerrar"
                            >
                                <X className="w-5 h-5 text-slate-600" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden px-8 py-8 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent relative bg-gradient-to-b from-slate-50 via-white to-slate-50">

                    {/* Welcome Message */}
                    {messages.length === 0 && (
                        <div className="pt-16 pb-8 relative animate-fadeIn">
                            <div className="max-w-2xl">
                                <h1 className="text-3xl font-light text-slate-900 leading-tight mb-3">
                                    Hola, ¿en qué deberíamos profundizar hoy?
                                </h1>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Estoy aquí para ayudarte con análisis, estrategias y decisiones ejecutivas. Puedes hacerme cualquier pregunta o pedirme que ejecute tareas específicas.
                                </p>
                                <div className="mt-6 flex flex-wrap gap-3">
                                    <button onClick={() => setInput("Sugerir estrategia Q4")} className="px-4 py-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs text-slate-700 font-medium transition-colors border border-slate-200 shadow-sm">
                                        Sugerir estrategia Q4
                                    </button>
                                    <button onClick={() => setInput("Analizar métricas clave")} className="px-4 py-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs text-slate-700 font-medium transition-colors border border-slate-200 shadow-sm">
                                        Analizar métricas clave
                                    </button>
                                    <button onClick={() => setInput("Revisar OKRs")} className="px-4 py-2.5 bg-white hover:bg-slate-50 rounded-lg text-xs text-slate-700 font-medium transition-colors border border-slate-200 shadow-sm">
                                        Revisar OKRs
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Message List */}
                    <div className="space-y-8 relative">
                        {messages.map((m, idx) => (
                            <div key={m.id} className={cx("flex flex-col gap-2", m.role === 'user' ? 'items-end' : 'items-start')}
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
                        ))}

                        {/* Loading Indicator */}
                        {isLoading && (
                            <div className="flex items-start gap-3 px-8 py-4 animate-pulse">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center flex-shrink-0">
                                    <Brain className="w-4 h-4 text-slate-600" />
                                </div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Composer */}
                <div
                    className="sticky bottom-0 bg-white border-t border-slate-200/40 px-8 py-6"
                    style={{
                        transform: 'perspective(1000px) translateZ(10px)',
                        transformStyle: 'preserve-3d',
                        boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.03), 0 -1px 0 rgba(255, 255, 255, 0.5) inset'
                    }}
                >
                    {isUploading && (
                        <div className="mb-4 flex items-center gap-2 text-sm text-slate-500">
                            <Loader className="w-4 h-4 animate-spin" />
                            Subiendo archivo...
                        </div>
                    )}

                    {pendingAttachment && (
                        <div className="mb-4 relative inline-block">
                            {pendingAttachment.type === 'image' ? (
                                <img src={pendingAttachment.url} alt="Preview" className="max-w-xs max-h-32 rounded-lg border-2 border-slate-300 shadow-md" />
                            ) : (
                                <div className="bg-slate-50 border-2 border-slate-300 rounded-lg p-3 shadow-md flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-slate-600" />
                                    <span className="text-sm text-slate-700 font-medium">{pendingAttachment.originalName}</span>
                                    <span className="text-xs text-slate-500">({pendingAttachment.mimeType})</span>
                                </div>
                            )}
                            <button
                                onClick={onRemoveAttachment}
                                className="absolute -top-2 -right-2 bg-slate-900 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-slate-800 shadow-lg"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    <div className="flex items-center gap-3 bg-white rounded-2xl p-4 border-2 border-slate-300 shadow-md hover:border-slate-400 transition-all duration-200 group">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
                            className="flex-1 bg-transparent border-none outline-none px-2 py-2 text-[14px] text-slate-900 placeholder-slate-500 font-normal"
                            placeholder="Escribe tu mensaje o comando..."
                        />

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="*/*"
                            onChange={onUpload}
                            className="hidden"
                        />

                        <div className="flex items-center gap-2 border-l border-slate-300 pl-3">
                            <button
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                disabled={isUploading}
                                className={cx(
                                    "p-2 rounded-lg transition-colors",
                                    isUploading ? "text-slate-400 cursor-not-allowed" : "hover:bg-slate-100 text-slate-600"
                                )}
                                title={isUploading ? "Subiendo archivo..." : "Subir archivo o imagen"}
                            >
                                <Paperclip className="w-5 h-5" />
                            </button>

                            {voiceSupported && (
                                <button
                                    onClick={onToggleListen}
                                    className={cx(
                                        "p-2 rounded-lg transition-all duration-300",
                                        listening ? "bg-red-100 text-red-600 animate-pulse" : "hover:bg-slate-100 text-slate-600"
                                    )}
                                    title={listening ? "Detener escucha" : "Activar voz"}
                                >
                                    {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                                </button>
                            )}

                            <button
                                onClick={onSend}
                                disabled={(!input.trim() && !pendingAttachment) || isLoading}
                                className={cx(
                                    "p-2 rounded-xl transition-all duration-300 shadow-sm",
                                    (!input.trim() && !pendingAttachment) || isLoading
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-slate-900 text-white hover:bg-slate-800 hover:shadow-md hover:scale-105"
                                )}
                            >
                                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            <AgentExecutionPanel
                visible={agentExecutionOpen}
                onClose={onCloseAgentExecution}
                chatContext={messages.map(m => m.text).join('\n')}
                userIntent={messages[messages.length - 1]?.text}
            />
        </div>
    );
}

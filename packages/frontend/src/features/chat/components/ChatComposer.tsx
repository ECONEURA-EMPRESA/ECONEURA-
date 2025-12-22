import React, { useRef } from "react";
import { Loader, Mic, MicOff, Send, Paperclip, FileText } from "lucide-react";
import { cx } from "../../../utils/classnames";
import { PendingAttachment } from "../types";

interface ChatComposerProps {
    input: string;
    setInput: (val: string) => void;
    onSend: () => void;
    isLoading: boolean;
    pendingAttachment: PendingAttachment | null;
    isUploading?: boolean;
    onUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveAttachment: () => void;
    voiceSupported?: boolean;
    listening?: boolean;
    onToggleListen?: () => void;
}

export function ChatComposer({
    input,
    setInput,
    onSend,
    isLoading,
    pendingAttachment,
    isUploading,
    onUpload,
    onRemoveAttachment,
    voiceSupported,
    listening,
    onToggleListen
}: ChatComposerProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
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
    );
}

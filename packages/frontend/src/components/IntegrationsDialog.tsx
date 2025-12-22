
import React, { useState } from 'react';
import { X, Check, Copy, AlertTriangle, RefreshCw, HardDrive } from 'lucide-react';
import { apiClient } from '../lib/apiClient';

interface IntegrationsDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const ROBOT_EMAIL = "358634200570-compute@developer.gserviceaccount.com";

export const IntegrationsDialog: React.FC<IntegrationsDialogProps> = ({ isOpen, onClose }) => {
    const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(ROBOT_EMAIL);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleVerify = async () => {
        setStatus('checking');
        try {
            const data = await apiClient.get<any>('/integrations/drive/status');

            if (data.status === 'connected') {
                setStatus('success');
                setMessage(data.message);
            } else {
                throw new Error(data.message || 'Error desconocido');
            }
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            setMessage(err.message || 'No se pudo conectar.');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-2xl bg-[#0F172A] border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <HardDrive className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Conexiones & Integraciones</h2>
                            <p className="text-sm text-slate-400">Gestiona los accesos de tu Ecosistema AI</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">

                    {/* Google Drive Card */}
                    <div className="bg-slate-900/50 rounded-xl border border-white/5 p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" className="w-5 h-5" alt="Drive" />
                                    Google Drive
                                </h3>
                                <p className="text-sm text-slate-400 mt-1">
                                    Permite que el Chat lea documentos compartidos.
                                </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold border ${status === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : status === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-800 border-white/10 text-slate-400'}`}>
                                {status === 'success' ? 'CONECTADO' : status === 'error' ? 'ERROR' : 'NO VERIFICADO'}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="text-sm text-slate-300">
                                1. Comparte tus carpetas de Drive con este email de servicio:
                            </div>

                            <div className="flex gap-2">
                                <code className="flex-1 p-3 bg-black/40 rounded-lg border border-white/10 text-slate-300 font-mono text-xs md:text-sm overflow-hidden text-ellipsis whitespace-nowrap">
                                    {ROBOT_EMAIL}
                                </code>
                                <button
                                    onClick={handleCopy}
                                    className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all flex items-center gap-2"
                                >
                                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    {copied ? 'Copiado' : 'Copiar'}
                                </button>
                            </div>

                            {/* Verification Action */}
                            <div className="pt-2 flex items-center justify-between border-t border-white/5 mt-4">
                                <div className="text-xs text-slate-500">
                                    {status === 'checking' && 'Verificando acceso a Drive...'}
                                    {status === 'success' && message}
                                    {status === 'error' && <span className="text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {message}</span>}
                                </div>

                                <button
                                    onClick={handleVerify}
                                    disabled={status === 'checking'}
                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    {status === 'checking' ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Verificar Conexión'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* n8n Automation Card (Info Only) */}
                    <div className="bg-slate-900/50 rounded-xl border border-white/5 p-5 opacity-70">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-5 h-5 bg-[#EA4B71] rounded flex items-center justify-center text-[10px] font-bold text-white">n8n</div>
                            <h3 className="text-lg font-semibold text-white">Automatizaciones</h3>
                        </div>
                        <p className="text-sm text-slate-400">
                            Gestionado automáticamente vía Cloud Run. Accede al panel "Automatizaciones" en el menú lateral para configurar workflows.
                        </p>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-4 bg-black/20 text-center">
                    <button onClick={onClose} className="text-sm text-slate-400 hover:text-white underline">
                        Cerrar panel
                    </button>
                </div>
            </div>
        </div>
    );
};

import React from "react";

interface WelcomeMessageProps {
    setInput: (val: string) => void;
}

export function WelcomeMessage({ setInput }: WelcomeMessageProps) {
    return (
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
    );
}

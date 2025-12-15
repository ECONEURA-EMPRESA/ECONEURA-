import React, { useState, useEffect } from 'react';
import { X, Terminal, Play, CheckCircle, AlertCircle, Loader, Cpu, Database, Shield } from 'lucide-react';
import { cx } from '../utils/classnames';

export interface AgentExecutionPanelProps {
  visible?: boolean;
  onClose?: () => void;
  chatContext?: string;
  userIntent?: string;
  dept?: any;
  darkMode?: boolean;
  onRunAgent?: (a: any) => Promise<void>;
  busyId?: string | null;
  onCreateAgent?: () => void;
  onConnectAgent?: (agent: any) => void;
}

export function AgentExecutionPanel({ visible, onClose, chatContext, userIntent }: AgentExecutionPanelProps) {
  const [steps, setSteps] = useState<Array<{ id: number; text: string; status: 'pending' | 'running' | 'done' | 'error' }>>([]);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      // Simulate execution steps
      setSteps([
        { id: 1, text: 'Analizando intención del usuario', status: 'running' },
        { id: 2, text: 'Seleccionando agentes especializados', status: 'pending' },
        { id: 3, text: 'Generando plan de ejecución', status: 'pending' },
        { id: 4, text: 'Ejecutando acciones', status: 'pending' },
        { id: 5, text: 'Verificando resultados', status: 'pending' }
      ]);
      setLogs(['[SYSTEM] Initializing Agent Execution Environment...']);

      // Simulation logic
      let currentStep = 1;
      const interval = setInterval(() => {
        setSteps(prev => prev.map(s => {
          if (s.id === currentStep) return { ...s, status: 'done' };
          if (s.id === currentStep + 1) return { ...s, status: 'running' };
          return s;
        }));

        const newLog = `[STEP ${currentStep}] Completed successfully.`;
        setLogs(prev => [...prev, newLog]);

        currentStep++;
        if (currentStep > 5) {
          clearInterval(interval);
          setLogs(prev => [...prev, '[SYSTEM] Execution finished.']);
        }
      }, 1500);

      return () => clearInterval(interval);
    } else {
      setSteps([]);
      setLogs([]);
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60] flex items-center justify-center animate-fadeIn">
      <div
        className="bg-white w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
        style={{ animation: 'scaleIn 0.3s ease-out' }}
      >
        {/* Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg border border-emerald-500/30">
              <Cpu className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Panel de Ejecución de Agentes</h2>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistema Activo
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar: Steps */}
          <div className="w-1/3 bg-slate-50 border-r border-slate-200 p-6 overflow-y-auto">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Flujo de Ejecución</h3>
            <div className="space-y-4">
              {steps.map((step, idx) => (
                <div key={step.id} className="relative pl-6">
                  {/* Line connector */}
                  {idx < steps.length - 1 && (
                    <div className={cx(
                      "absolute left-[9px] top-6 bottom-[-16px] w-0.5",
                      step.status === 'done' ? "bg-emerald-500" : "bg-slate-200"
                    )}></div>
                  )}

                  {/* Status Dot */}
                  <div className={cx(
                    "absolute left-0 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 z-10 bg-white",
                    step.status === 'done' ? "border-emerald-500 text-emerald-500" :
                      step.status === 'running' ? "border-blue-500 text-blue-500" :
                        step.status === 'error' ? "border-red-500 text-red-500" :
                          "border-slate-300 text-slate-300"
                  )}>
                    {step.status === 'done' ? <CheckCircle className="w-3 h-3" /> :
                      step.status === 'running' ? <Loader className="w-3 h-3 animate-spin" /> :
                        step.status === 'error' ? <AlertCircle className="w-3 h-3" /> :
                          <div className="w-2 h-2 rounded-full bg-slate-300"></div>}
                  </div>

                  <div className={cx(
                    "text-sm font-medium transition-colors",
                    step.status === 'done' ? "text-slate-900" :
                      step.status === 'running' ? "text-blue-600" :
                        "text-slate-500"
                  )}>
                    {step.text}
                  </div>
                  {step.status === 'running' && (
                    <div className="text-xs text-blue-500 mt-1 animate-pulse">Procesando...</div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Contexto</h3>
              <div className="bg-white p-3 rounded-lg border border-slate-200 text-xs text-slate-600 font-mono break-words">
                {userIntent || "Sin intención detectada"}
              </div>
            </div>
          </div>

          {/* Right Content: Terminal/Logs */}
          <div className="flex-1 bg-[#1e1e1e] text-slate-300 p-6 overflow-hidden flex flex-col font-mono text-sm">
            <div className="flex items-center justify-between mb-4 border-b border-slate-700 pb-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-200">Console Output</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50"></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
              {logs.map((log, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-slate-600 select-none">{new Date().toLocaleTimeString()}</span>
                  <span className={cx(
                    log.includes('Error') ? 'text-red-400' :
                      log.includes('Warning') ? 'text-yellow-400' :
                        log.includes('Success') ? 'text-emerald-400' :
                          'text-slate-300'
                  )}>{log}</span>
                </div>
              ))}
              <div className="animate-pulse text-emerald-500">_</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

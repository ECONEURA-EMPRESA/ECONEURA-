/**
 * ECONEURA - HITL Approval Modal
 * Modal para aprobación humana de acciones críticas
 */

import React from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

interface HITLApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  darkMode: boolean;
  data: {
    functionName: string;
    functionArgs: Record<string, unknown>;
    functionResult?: { message?: string };
    neuraName: string;
  };
}

export function HITLApprovalModal({
  isOpen,
  onClose,
  onApprove,
  onReject,
  darkMode,
  data
}: HITLApprovalModalProps) {
  const { functionName, functionArgs, functionResult, neuraName } = data;
  if (!isOpen) return null;

  const getFunctionEmoji = (name: string) => {
    if (name.includes('agendar')) return '📅';
    if (name.includes('alerta')) return '🚨';
    if (name.includes('webhook')) return '⚡';
    if (name.includes('reporte')) return '📄';
    return '🔧';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="bg-amber-50 border-b-2 border-amber-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Aprobación Requerida (HITL)</h2>
                <p className="text-xs text-slate-600">{neuraName} solicita tu autorización</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {/* Función a ejecutar */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-3xl">{getFunctionEmoji(functionName)}</span>
              <h3 className="text-base font-bold text-slate-900">
                {functionName.replace(/_/g, ' ').toUpperCase()}
              </h3>
            </div>

            {/* Parámetros */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-2">Parámetros:</div>
              <div className="space-y-2">
                {Object.entries(functionArgs).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <span className="text-xs font-mono text-slate-500">{key}:</span>
                    <span className="text-xs font-semibold text-slate-900">
                      {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resultado esperado */}
          {functionResult && (
            <div className="mb-6">
              <div className="text-sm font-semibold text-slate-700 mb-2">Resultado de la ejecución:</div>
              <div className="bg-slate-100 rounded-xl p-4 border-l-4 border-slate-900">
                <p className="text-sm text-slate-900">
                  {functionResult.message || 'Función ejecutada'}
                </p>
              </div>
            </div>
          )}

          {/* Advertencia GDPR/Compliance */}
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="flex items-start gap-2">
              <span className="text-blue-600 text-sm">ℹ️</span>
              <div className="text-xs text-blue-900">
                <strong>Compliance:</strong> Esta acción será registrada en el audit log
                (GDPR Art. 30, AI Act Anexo IV). Requiere aprobación humana para cumplir
                con controles de supervisión.
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Acciones */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex gap-3">
          <button
            onClick={onReject}
            className="flex-1 px-4 py-3 bg-white border-2 border-slate-300 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <XCircle className="w-4 h-4" />
            Rechazar
          </button>
          <button
            onClick={onApprove}
            className="flex-1 px-4 py-3 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg"
          >
            <CheckCircle className="w-4 h-4" />
            Aprobar y Ejecutar
          </button>
        </div>
      </div>
    </div>
  );
}


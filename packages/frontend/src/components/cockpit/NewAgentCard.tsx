/**
 * NewAgentCard - Tarjeta para crear nuevos agentes
 * Extraído de EconeuraCockpit.tsx para mejor mantenibilidad
 */
import React from 'react';
import { Workflow } from 'lucide-react';
import { hexToRgb } from '../../utils/colors';

export interface NewAgentCardProps {
    deptId: string;
    deptColor: string;
    onCreate: (deptId: string) => void;
}

export function NewAgentCard({ deptId, deptColor, onCreate }: NewAgentCardProps) {
    const { r, g, b } = hexToRgb(deptColor);

    const handleCreate = () => {
        const name = prompt('Nombre del nuevo agente:');
        if (name) {
            alert(
                `Creando agente "${name}" para ${deptId}...\n\n(En producción esto se guardaría en la base de datos)`
            );
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
            {/* Icono central */}
            <div
                className="p-2.5 rounded-xl border border-slate-200/60 shadow-md group-hover:scale-110 transition-all duration-300"
                style={{
                    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
                    boxShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.15)`
                }}
            >
                <Workflow className="w-5 h-5" style={{ color: deptColor }} />
            </div>

            {/* Texto */}
            <div className="text-center">
                <div className="text-base font-bold text-slate-900">Nuevo Agente</div>
                <div className="text-sm text-slate-600 mt-1">Crear agente personalizado</div>
            </div>

            {/* Botón crear */}
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

export default NewAgentCard;

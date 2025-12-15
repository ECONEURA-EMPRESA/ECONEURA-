// 🎨 ZONA SEGURA DE DISEÑO – modifica libremente el JSX yTailwind
import React from 'react';
import { useCockpitData } from '../../hooks/useCockpitData';
import EconeuraCockpit from '../../EconeuraCockpit';

interface CockpitLayoutProps {
    user?: {
        id: string;
        email: string;
        name: string;
        tenantId?: string;
    };
    onLogout?: () => void;
}

export const CockpitLayout: React.FC<CockpitLayoutProps> = ({ user, onLogout }) => {
    const { isLoading, error } = useCockpitData();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-white text-lg font-semibold">Cargando Cockpit...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full p-8 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-xl">
                    <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
                    <p className="text-red-200">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 w-full px-4 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all font-semibold"
                    >
                        Reintentar
                    </button>
                </div>
            </div>
        );
    }

    // NOTA: Actualmente reutilizamos el componente EconeuraCockpit existente
    // En el futuro, podemos refactorizar esto en componentes más pequeños
    // y usar los datos de useCockpitData para cargar dinámicamente
    return <EconeuraCockpit user={user} onLogout={onLogout} />;
};

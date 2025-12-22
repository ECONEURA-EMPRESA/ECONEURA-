
import React from 'react';

export function FooterComponent() {
    return (
        <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200/50 mt-12">
            <div className="flex items-center justify-center gap-4 mb-2">
                <span>© 2025 ECONEURA AI Inc.</span>
                <span>•</span>
                <span>Privacidad</span>
                <span>•</span>
                <span>Términos</span>
            </div>
            <div className="opacity-50">
                Versión 2.5 (Stable) • Powered by Neural Agents
            </div>
        </footer>
    );
}

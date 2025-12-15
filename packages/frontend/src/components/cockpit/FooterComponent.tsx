/**
 * FooterComponent - Footer global del Cockpit
 * Extraído de EconeuraCockpit.tsx para mejor mantenibilidad
 */
import React from 'react';

function handleFooterClick(section: string): void {
    switch (section) {
        case 'Privacidad':
            window.open('/privacy', '_blank');
            break;
        case 'Cookies':
            window.open('/cookies', '_blank');
            break;
        case 'Términos':
            window.open('/terms', '_blank');
            break;
        case 'Marcas registradas':
            window.open('/trademarks', '_blank');
            break;
        case 'Cumplimiento UE':
            window.open('/compliance', '_blank');
            break;
        default:
            // Navegación a sección desconocida
            break;
    }
}

export function FooterComponent(): React.ReactElement {
    return (
        <footer className="bg-slate-50/50 px-6 py-3 text-[10px] text-slate-500">
            <div className="flex flex-wrap items-center justify-center gap-2 font-normal">
                <span className="text-slate-600">Español (España)</span>
                <span role="separator" aria-hidden className="text-slate-300">·</span>
                <button
                    onClick={() => handleFooterClick('Privacidad')}
                    className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
                >
                    Tus opciones de privacidad
                </button>
                <span role="separator" aria-hidden className="text-slate-300">·</span>
                <button
                    onClick={() => handleFooterClick('Cookies')}
                    className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
                >
                    Gestionar cookies
                </button>
                <span role="separator" aria-hidden className="text-slate-300">·</span>
                <button
                    onClick={() => handleFooterClick('Términos')}
                    className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
                >
                    Condiciones de uso
                </button>
                <span role="separator" aria-hidden className="text-slate-300">·</span>
                <button
                    onClick={() => handleFooterClick('Marcas registradas')}
                    className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
                >
                    Marcas registradas
                </button>
                <span role="separator" aria-hidden className="text-slate-300">·</span>
                <button
                    onClick={() => handleFooterClick('Cumplimiento UE')}
                    className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
                >
                    Docs cumplimiento de la UE
                </button>
                <span role="separator" aria-hidden className="text-slate-300">·</span>
                <span className="text-slate-600">© ECONEURA 2025</span>
            </div>
        </footer>
    );
}

export default FooterComponent;

import React from 'react';
import { Loader } from 'lucide-react';

export function LoadingSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
            {/* Animated background lights */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[140px]" style={{ animation: 'pulse 3s ease-in-out infinite 1s' }}></div>

            <div className="text-center">
                {/* Logo skeleton */}
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
                </div>

                {/* Brand name */}
                <h1 className="text-4xl font-black text-white mb-4 tracking-tight"
                    style={{
                        fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                        letterSpacing: '-0.03em',
                        textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
                    }}>
                    ECONEURA
                </h1>

                {/* Loading text */}
                <div className="flex items-center justify-center gap-3 text-emerald-400">
                    <Loader className="w-5 h-5 animate-spin" />
                    <p className="text-lg font-medium">Cargando tu ecosistema...</p>
                </div>

                {/* Pulsing dots */}
                <div className="flex justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
}

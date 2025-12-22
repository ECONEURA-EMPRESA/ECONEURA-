import React, { useEffect } from 'react';
import logoImage from '../assets/images/logo-v2.png';

interface LogoEconeuraProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  darkMode?: boolean;
}

const dimensionMap: Record<NonNullable<LogoEconeuraProps['size']>, number> = {
  xs: 32,
  sm: 40,
  md: 56,
  lg: 96,
  xl: 120
};

const textSizeMap: Record<NonNullable<LogoEconeuraProps['size']>, string> = {
  xs: 'text-base',
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
};

export function LogoEconeura({
  size = 'md',
  showText = true,
  className = '',
  darkMode = false
}: LogoEconeuraProps) {
  useEffect(() => {
    console.log('Logo debug:', { logoImage, publicFallback: '/logo-v2.png' });
  }, []);

  const dimension = dimensionMap[size] ?? 56;
  const ringGradient = darkMode
    ? 'linear-gradient(135deg, rgba(16,185,129,0.8), rgba(6,182,212,0.8), rgba(59,130,246,0.8))'
    : 'linear-gradient(135deg, rgba(16,185,129,0.5), rgba(6,182,212,0.5), rgba(59,130,246,0.5))';

  const midOffset = Math.round(dimension * 0.14);
  const outerOffset = Math.round(dimension * 0.2);
  const glowOffset = Math.round(dimension * 0.26);
  const ringPadding = Math.max(2, Math.round(dimension * 0.03));
  const innerInset = Math.max(2, Math.round(dimension * 0.05));

  return (
    <div className={`inline-flex flex-col items-center justify-center ${className}`}>
      <div className="relative group" style={{ width: dimension, height: dimension }}>
        {/* Glow effect back */}
        <div
          className="absolute inset-0 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 bg-emerald-500"
        ></div>

        {/* Main Rings */}
        <div
          className="absolute inset-0 rounded-full border-2 border-emerald-500/30"
          style={{ padding: '2px' }}
        >
          <div className="w-full h-full rounded-full border border-teal-400/20"></div>
        </div>

        {/* Image Container */}
        <div
          className="absolute inset-2 rounded-full overflow-hidden flex items-center justify-center bg-slate-900 z-10 p-3"
        >
          <img
            src={logoImage || '/logo-v2.png'}
            alt="ECONEURA logo"
            className="w-full h-full object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.onerror = null;
              target.src = '/logo-v2.png';
            }}
          />
        </div>
      </div>

      {showText && (
        <div className="relative mt-3 text-center">
          <span
            className={`relative ${textSizeMap[size]} font-black tracking-tight ${darkMode ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent' : 'text-slate-900'
              }`}
            style={{
              fontFamily: '"Inter", sans-serif',
              letterSpacing: '-0.03em',
            }}
          >
            ECONEURA
          </span>
        </div>
      )}
    </div>
  );
}

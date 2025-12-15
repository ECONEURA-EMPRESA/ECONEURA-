import React from 'react';

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
  lg: 72,
  xl: 88
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
        {/* Anillos orbitales */}
        <div
          className="absolute rounded-full border border-emerald-400/15 animate-spin"
          style={{ animationDuration: '20s', inset: -midOffset }}
        ></div>
        <div
          className="absolute rounded-full border border-teal-400/10"
          style={{ animation: 'spin 15s linear infinite reverse', inset: -outerOffset }}
        ></div>

        {/* Resplandor exterior */}
        <div
          className="absolute rounded-full blur-2xl opacity-50 group-hover:opacity-80 transition-opacity duration-700"
          style={{
            inset: -glowOffset,
            background: 'linear-gradient(90deg, rgba(251,191,36,0.25), rgba(14,165,233,0.2), rgba(16,185,129,0.25))'
          }}
        ></div>

        {/* Borde circular principal */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-500 group-hover:scale-[1.02]"
          style={{
            padding: ringPadding,
            background: ringGradient,
            backgroundSize: '200% 200%',
            animation: 'gradient-shift 8s ease infinite',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
            boxShadow: '0 0 25px rgba(16, 185, 129, 0.4), 0 0 50px rgba(6, 182, 212, 0.2), inset 0 0 15px rgba(255, 255, 255, 0.08)'
          }}
        ></div>

        {/* Inner glow */}
        <div
          className="absolute rounded-full bg-gradient-to-br from-emerald-400/10 via-teal-400/10 to-cyan-400/10 backdrop-blur-sm"
          style={{ inset: innerInset }}
        ></div>
        <div
          className="absolute rounded-full bg-gradient-to-tr from-white/8 via-transparent to-transparent"
          style={{ inset: innerInset }}
        ></div>

        {/* Imagen circular */}
        <div
          className="absolute rounded-full overflow-hidden flex items-center justify-center bg-slate-900/40 backdrop-blur-md"
          style={{ inset: innerInset }}
        >
          <img
            src="/logo-econeura.png"
            alt="ECONEURA logo"
            className="w-full h-full object-cover relative z-10"
            style={{
              filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.5)) brightness(1.08) contrast(1.05)',
              objectPosition: 'center',
              transform: 'scale(1.32)',
              transformOrigin: 'center center'
            }}
          />
        </div>

        {/* Brillo superior */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            inset: innerInset,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.25), transparent 60%)',
            clipPath: 'ellipse(80% 30% at 50% 20%)'
          }}
        ></div>
      </div>

      {showText && (
        <div className="relative mt-5 text-center">
          <span
            className={`absolute top-[2px] left-1/2 -translate-x-1/2 ${textSizeMap[size]} font-black tracking-tight text-slate-500/50 blur-[0.5px]`}
            style={{ fontFamily: '"Inter","SF Pro Display",system-ui' }}
            aria-hidden="true"
          >
            ECONEURA
          </span>
          <span
            className={`relative ${textSizeMap[size]} font-black tracking-tight ${
              darkMode ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent' : 'text-slate-900'
            }`}
            style={{
              fontFamily: '"Inter","SF Pro Display",system-ui',
              letterSpacing: '-0.03em',
              textShadow: darkMode
                ? '0 4px 16px rgba(16,185,129,0.3)'
                : '0 2px 3px rgba(255,255,255,0.9), 0 3px 8px rgba(0,0,0,0.08)'
            }}
          >
            ECONEURA
          </span>
        </div>
      )}
    </div>
  );
}

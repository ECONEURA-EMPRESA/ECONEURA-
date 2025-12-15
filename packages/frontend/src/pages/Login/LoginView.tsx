// ZONA SEGURA DE DISEÑO – modifica libremente el JSX y Tailwind
import React, { useEffect } from 'react';
import { useAuthLogic } from '../../hooks/useAuthLogic';
import { Mail, Lock, User } from 'lucide-react';
import { LogoEconeura } from '../../components/LogoEconeura';

interface LoginViewProps {
    onLoginSuccess: (token: string, user: {
        id: string;
        email: string;
        name: string;
        tenantId?: string;
    }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
    const {
        mode,
        setMode,
        formState,
        setFormState,
        handleLogin,
        handleOAuthLogin,
        error,
        setError,
        isLoading,
        rememberMe,
        setRememberMe,
    } = useAuthLogic();

    // Detect OAuth callback
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const auth = params.get('auth');
        const provider = params.get('provider');
        const token = params.get('token');
        const email = params.get('email');
        const name = params.get('name');

        if (auth === 'success' && provider && token) {
            const user = {
                id: `oauth-${provider}`,
                email: decodeURIComponent(email || ''),
                name: decodeURIComponent(name || 'Usuario'),
            };

            onLoginSuccess(token, user);
            window.history.replaceState({}, '', '/');
        } else if (auth === 'error') {
            setError('Error en autenticación OAuth. Inténtalo de nuevo.');
            window.history.replaceState({}, '', '/');
        }
    }, [onLoginSuccess, setError]);

    // Handle form submit
    const onSubmit = async (e: React.FormEvent) => {
        try {
            const result = await handleLogin(e);
            if (result) {
                onLoginSuccess(result.token, result.user);
            }
        } catch {
            // Error already handled by hook
        }
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
            {/* ✅ VIDEO BACKGROUND LAYER */}
            <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                style={{ filter: 'brightness(0.4) contrast(1.1) saturate(1.2)' }}
            >
                <source src="/login-bg.mp4" type="video/mp4" />
                {/* Fallback gradient if video fails */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"></div>
            </video>

            {/* Overlay Gradient for Readability */}
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>

            {/* Floating particles effect (preserved) */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animation: `float 15s ${Math.random() * 3}s infinite ease-in-out`,
                        }}
                    />
                ))}
            </div>

            <div className="bg-white/5 backdrop-blur-2xl rounded-[32px] shadow-[0_35px_60px_-15px_rgba(0,0,0,0.6)] w-full max-w-md p-10 border border-white/10 relative overflow-hidden group">
                {/* Inner glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

                {/* Brillo superior */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>

                {/* Logo y Header */}
                <div className="text-center mb-10">
                    <LogoEconeura size="xl" showText={false} darkMode className="mt-6 mb-6 hover:scale-105 transition-transform duration-500" />

                    {/* Título ECONEURA */}
                    <h1
                        className="text-5xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-emerald-200 mb-2"
                        style={{
                            fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                            textShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                        }}
                    >
                        ECONEURA
                    </h1>

                    {/* Subtítulo */}
                    <div className="space-y-1">
                        <p
                            className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-cyan-400 to-teal-400 uppercase tracking-widest"
                            style={{
                                letterSpacing: '0.1em',
                                filter: 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.3))',
                                fontFamily: '"Orbitron", "Inter", sans-serif'
                            }}
                        >
                            BIENVENIDO
                        </p>
                        <p
                            className="text-sm md:text-base font-bold text-slate-300 uppercase tracking-[0.2em]"
                            style={{
                                fontFamily: '"Inter", sans-serif',
                                textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                            }}
                        >
                            A TU ECOSISTEMA DE INTELIGENCIA ARTIFICIAL
                        </p>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-2xl text-red-200 text-sm backdrop-blur-xl animate-shake">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-5">
                    {mode === 'register' && (
                        <div className="group/input">
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300/80 group-focus-within/input:text-emerald-400 transition-colors z-10" />
                                <input
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/80 transition-all duration-300 backdrop-blur-sm"
                                    placeholder="Nombre completo"
                                    required
                                />
                            </div>
                        </div>
                    )}

                    <div className="group/input">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/80 group-focus-within/input:text-cyan-400 transition-colors z-10" />
                            <input
                                type="email"
                                value={formState.email}
                                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all duration-300 backdrop-blur-sm"
                                placeholder="Correo electrónico"
                                required
                            />
                        </div>
                    </div>

                    <div className="group/input">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300/80 group-focus-within/input:text-emerald-400 transition-colors z-10" />
                            <input
                                type="password"
                                value={formState.password}
                                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                                className="w-full pl-12 pr-4 py-4 bg-slate-900/50 border border-white/10 rounded-2xl text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/80 transition-all duration-300 backdrop-blur-sm"
                                placeholder="Contraseña"
                                required
                            />
                        </div>
                    </div>

                    {/* Remember me checkbox */}
                    {mode === 'login' && (
                        <div className="flex items-center gap-3 px-1">
                            <div className="relative flex items-center">
                                <input
                                    type="checkbox"
                                    id="rememberMe"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="peer appearance-none w-5 h-5 rounded-md border border-white/20 bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer transition-all"
                                />
                                <svg className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-[3px] top-[3px] transition-opacity" viewBox="0 0 14 14" fill="none">
                                    <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <label htmlFor="rememberMe" className="text-sm text-slate-300/90 cursor-pointer hover:text-emerald-300 transition-colors select-none">
                                Recordar mi dispositivo
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full relative group overflow-hidden bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-4 rounded-2xl font-bold tracking-wide shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_35px_rgba(16,185,129,0.5)] transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:hover:shadow-none"
                    >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                            {isLoading ? 'Conectando...' : mode === 'login' ? 'INICIAR SESIÓN' : 'REGISTRARSE'}
                            {!isLoading && <span className="text-xl">→</span>}
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out"></div>
                    </button>
                </form>

                {/* Toggle mode */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-sm text-slate-400 hover:text-white font-medium transition-colors duration-300"
                    >
                        {mode === 'login' ? (
                            <span>¿Nuevo aquí? <span className="text-emerald-400 font-bold hover:underline">Solicita acceso</span></span>
                        ) : (
                            <span>¿Ya eres miembro? <span className="text-emerald-400 font-bold hover:underline">Entra ahora</span></span>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-white/5 text-center text-[10px] text-slate-500/60 uppercase tracking-widest font-semibold">
                    Protected by ECONEURA CLOUD SECURITY
                </div>
            </div>
        </div>
    );
};

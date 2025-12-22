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
        <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-['Inter']">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center z-0 transition-transform duration-[20s] hover:scale-105"
                style={{
                    backgroundImage: 'url(/login-bg-futuristic.png)',
                }}
            >
                <div className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm"></div>

                {/* Gradient overlay for depth */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-[#020617]/50"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-[#020617]/50 via-transparent to-[#020617]/50"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-[420px] mx-4 p-8">
                {/* Logo Area */}
                <div className="flex flex-col items-center mb-12">
                    <div className="relative mb-6 group cursor-pointer">
                        <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all duration-500"></div>
                        <LogoEconeura size="lg" className="relative transform group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
                    </div>

                    <div className="text-center space-y-1">
                        <h1
                            className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-slate-200 tracking-tight"
                            style={{
                                textShadow: '0 0 30px rgba(16, 185, 129, 0.2)',
                                letterSpacing: '-0.02em'
                            }}
                        >
                            ECONEURA
                        </h1>
                        <div className="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent my-3"></div>
                        <p
                            className="text-[10px] md:text-xs font-bold tracking-[0.3em] text-emerald-400 uppercase"
                            style={{
                                textShadow: '0 0 10px rgba(16, 185, 129, 0.5)'
                            }}
                        >
                            Intelligence Ecosystem
                        </p>
                    </div>
                </div>

                {/* Glass Card */}
                <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-3xl p-1 shadow-[0_0_50px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
                    <div className="bg-[#0f172a]/40 rounded-[20px] p-6 border border-white/[0.02]">
                        {/* Error message */}
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm backdrop-blur-md flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                {error}
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={onSubmit} className="space-y-4">
                            {mode === 'register' && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold text-slate-400 ml-1">NOMBRE COMPLETO</label>
                                    <div className="relative group/input">
                                        <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-sm opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300"></div>
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors z-10" />
                                        <input
                                            type="text"
                                            value={formState.name}
                                            onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                            className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/80 transition-all duration-300 relative z-10"
                                            placeholder="Ej. Juan Pérez"
                                            required
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 ml-1">EMAIL CORPORATIVO</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-cyan-500/5 rounded-xl blur-sm opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300"></div>
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors z-10" />
                                    <input
                                        type="email"
                                        value={formState.email}
                                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:bg-slate-900/80 transition-all duration-300 relative z-10"
                                        placeholder="usuario@empresa.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-400 ml-1">CONTRASEÑA</label>
                                <div className="relative group/input">
                                    <div className="absolute inset-0 bg-emerald-500/5 rounded-xl blur-sm opacity-0 group-focus-within/input:opacity-100 transition-opacity duration-300"></div>
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-emerald-400 transition-colors z-10" />
                                    <input
                                        type="password"
                                        value={formState.password}
                                        onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                                        className="w-full pl-11 pr-4 py-3.5 bg-slate-950/50 border border-white/10 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:bg-slate-900/80 transition-all duration-300 relative z-10"
                                        placeholder="••••••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Remember me checkbox */}
                            {mode === 'login' && (
                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-2">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                id="rememberMe"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                                className="peer appearance-none w-4 h-4 rounded border border-white/20 bg-white/5 checked:bg-emerald-500 checked:border-emerald-500 cursor-pointer transition-all"
                                            />
                                            <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 left-[2px] top-[2px] transition-opacity" viewBox="0 0 14 14" fill="none">
                                                <path d="M3 7L6 10L11 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <label htmlFor="rememberMe" className="text-xs text-slate-400 cursor-pointer hover:text-emerald-400 transition-colors select-none font-medium">
                                            Recordar sesión
                                        </label>
                                    </div>
                                    <a href="#" className="text-xs text-emerald-500/80 hover:text-emerald-400 transition-colors font-medium">¿Olvidaste tu clave?</a>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full relative group mt-4 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 rounded-xl transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-[0_0_30px_rgba(16,185,129,0.3)]"></div>
                                <div className="relative px-6 py-3.5 flex items-center justify-center gap-2">
                                    <span className="font-bold text-white tracking-wide text-sm">
                                        {isLoading ? 'ACCEDIENDO...' : mode === 'login' ? 'INICIAR SESIÓN' : 'CREAR CUENTA'}
                                    </span>
                                    {!isLoading && <div className="w-1 h-1 rounded-full bg-white animate-pulse"></div>}
                                </div>
                            </button>
                        </form>

                        {/* Toggle mode */}
                        <div className="mt-6 text-center border-t border-white/5 pt-5">
                            <button
                                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                                className="text-xs text-slate-500 hover:text-slate-300 font-medium transition-colors duration-300"
                            >
                                {mode === 'login' ? (
                                    <span>¿No tienes acceso? <span className="text-emerald-400 hover:underline">Contactar Admin</span></span>
                                ) : (
                                    <span>¿Ya tienes cuenta? <span className="text-emerald-400 hover:underline">Entrar</span></span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <p className="mt-8 text-center text-[10px] text-slate-600 font-medium uppercase tracking-widest">
                    © 2025 Econeura Cloud System
                </p>
            </div>
        </div>
    );
};

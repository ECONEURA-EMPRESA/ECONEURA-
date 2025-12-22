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
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0a0a0a]">
            {/* Background elements to match original design */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[128px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[128px]"></div>

            <div className="w-full max-w-md bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="text-center mb-10">
                    <LogoEconeura size="lg" className="mx-auto mb-6" />
                    <h1 className="text-3xl font-bold text-white mb-2">ECONEURA</h1>
                    <p className="text-slate-400">Tu ecosistema de inteligencia artificial</p>
                </div>

                {/* Error message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                    <span className="text-sm text-slate-400 font-medium px-2">Acceso Seguro</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                </div>

                {/* Form */}
                <form onSubmit={onSubmit} className="space-y-4">
                    {mode === 'register' && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">Nombre completo</label>
                            <div className="relative group">
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/30 via-emerald-400/20 to-cyan-400/30 opacity-60 group-focus-within:opacity-100 blur-xl transition-all duration-300"></div>
                                <div className="absolute inset-[1px] rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl shadow-[0_15px_60px_rgba(0,0,0,0.35)]"></div>
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300/80 z-10" />
                                <input
                                    type="text"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    className="relative z-10 w-full pl-12 pr-4 py-3.5 bg-transparent rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-0"
                                    placeholder="Juan Pérez"
                                    required
                                />
                                <div className="absolute -bottom-2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/25 via-emerald-400/15 to-sky-500/25 opacity-60 group-focus-within:opacity-100 blur-xl transition-all duration-300"></div>
                            <div className="absolute inset-[1px] rounded-2xl bg-slate-950/65 border border-white/10 backdrop-blur-xl shadow-[0_15px_60px_rgba(0,0,0,0.35)]"></div>
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/80 z-10" />
                            <input
                                type="email"
                                value={formState.email}
                                onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                                className="relative z-10 w-full pl-12 pr-4 py-3.5 bg-transparent rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-0"
                                placeholder="tu@email.com"
                                required
                            />
                            <div className="absolute -bottom-2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
                        <div className="relative group">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/25 via-teal-500/20 to-blue-500/25 opacity-60 group-focus-within:opacity-100 blur-xl transition-all duration-300"></div>
                            <div className="absolute inset-[1px] rounded-2xl bg-slate-950/65 border border-white/10 backdrop-blur-xl shadow-[0_15px_60px_rgba(0,0,0,0.35)]"></div>
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300/80 z-10" />
                            <input
                                type="password"
                                value={formState.password}
                                onChange={(e) => setFormState({ ...formState, password: e.target.value })}
                                className="relative z-10 w-full pl-12 pr-4 py-3.5 bg-transparent rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-0"
                                placeholder="••••••••"
                                required
                            />
                            <div className="absolute -bottom-2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-teal-400/60 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                        </div>
                    </div>

                    {/* Remember me checkbox */}
                    {mode === 'login' && (
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="rememberMe"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="w-4 h-4 rounded border-white/20 bg-white/10 text-emerald-500 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                            />
                            <label htmlFor="rememberMe" className="text-sm text-slate-300 cursor-pointer select-none">
                                Mantener sesión iniciada
                            </label>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
                    >
                        {isLoading ? 'Cargando...' : mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}
                    </button>
                </form>

                {/* Toggle mode */}
                <div className="mt-8 text-center">
                    <button
                        onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                        className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-all duration-200"
                    >
                        {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
                    Al continuar, aceptas nuestros{' '}
                    <a href="/terms" target="_blank" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
                        Términos
                    </a>{' '}
                    y{' '}
                    <a href="/privacy" target="_blank" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
                        Privacidad
                    </a>
                </div>
            </div>
        </div>
    );
};

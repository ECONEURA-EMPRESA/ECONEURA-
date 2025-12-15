import React, { useState, useEffect } from 'react';
import { API_URL } from '../config/api';
import { Mail, Lock, User } from 'lucide-react';
import { LogoEconeura } from './LogoEconeura';

interface User {
  id: string;
  email: string;
  name: string;
  tenantId?: string;
}

interface LoginProps {
  onLoginSuccess: (token: string, user: User) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  // Force deploy trigger v1.0.1

  // Agregar animaciones CSS para efectos premium
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.3;
        }
        50% {
          transform: translateY(-20px) translateX(10px);
          opacity: 0.7;
        }
      }
      @keyframes gradient-shift {
        0%, 100% {
          background-position: 0% 50%;
        }
        50% {
          background-position: 100% 50%;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Detectar callback de OAuth en URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get('auth');
    const provider = params.get('provider');
    const token = params.get('token');
    const email = params.get('email');
    const name = params.get('name');

    if (auth === 'success' && provider && token) {
      // OAuth exitoso - usar token de URL
      const user = {
        id: `oauth-${provider}`,
        email: decodeURIComponent(email || ''),
        name: decodeURIComponent(name || 'Usuario')
      };

      localStorage.setItem('econeura_token', token);
      localStorage.setItem('econeura_user', JSON.stringify(user));
      onLoginSuccess(token, user);

      // Limpiar URL
      window.history.replaceState({}, '', '/');
    } else if (auth === 'error') {
      setError('Error en autenticación OAuth. Inténtalo de nuevo.');
      window.history.replaceState({}, '', '/');
    }
  }, [onLoginSuccess]);

  // Función para iniciar OAuth (solo Google y Microsoft)
  const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
    window.location.href = `${API_URL.replace('/api', '')}/api/auth/${provider}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || (mode === 'register' && !name)) {
      setError('Por favor completa todos los campos');
      return;
    }
    setError('');

    // Validación simple de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Email inválido');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name };

      const response = await fetch(`${API_URL.replace('/api', '')}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Authentication failed');
      }

      const data = await response.json();

      // Guardar token según "Remember me"
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('econeura_token', data.token);
      storage.setItem('econeura_user', JSON.stringify(data.user));

      // Limpiar del otro storage si existe
      const otherStorage = rememberMe ? sessionStorage : localStorage;
      otherStorage.removeItem('econeura_token');
      otherStorage.removeItem('econeura_user');

      onLoginSuccess(data.token, data.user);

    } catch (err: unknown) {
      // Mensajes de error específicos y útiles
      let errorMessage = 'Error de conexión';

      const error = err instanceof Error ? err : new Error(String(err));
      if (error.message) {
        // Errores específicos de la API
        if (error.message.includes('Invalid credentials') || error.message.includes('Authentication failed')) {
          errorMessage = 'Email o contraseña incorrectos';
        } else if (error.message.includes('User not found')) {
          errorMessage = mode === 'login'
            ? 'Usuario no encontrado. ¿Necesitas registrarte?'
            : 'Error al crear usuario';
        } else if (error.message.includes('Email already exists')) {
          errorMessage = 'Este email ya está registrado. ¿Quieres iniciar sesión?';
        } else if (error.message.includes('Network')) {
          errorMessage = 'Sin conexión a internet. Verifica tu red';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'El servidor tardó demasiado en responder. Inténtalo de nuevo';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background lights */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/15 rounded-full blur-[140px] animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-cyan-500/15 rounded-full blur-[140px]" style={{ animation: 'pulse 3s ease-in-out infinite 1s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[100px] -translate-x-1/2 -translate-y-1/2"></div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float 15s ${Math.random() * 3}s infinite ease-in-out`
            }}
          />
        ))}
      </div>

      <div className="bg-gradient-to-br from-white/5 via-white/10 to-white/5 backdrop-blur-3xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] w-full max-w-md p-10 border border-white/10 relative overflow-hidden">
        {/* Inner glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-cyan-500/5 pointer-events-none"></div>

        {/* Brillo superior */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent"></div>

        {/* Logo y Header */}
        <div className="text-center mb-10">
          <LogoEconeura size="lg" showText={false} darkMode className="mt-16 mb-6" />

          {/* Título ECONEURA */}
          <h1 className="text-4xl font-black tracking-tight text-white mb-3"
              style={{
                fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                letterSpacing: '-0.03em',
                textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)'
              }}>
            ECONEURA
          </h1>

          {/* Subtítulo */}
          <div className="space-y-2">
            <p className="text-xl font-semibold text-emerald-400"
               style={{
                 fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                 letterSpacing: '-0.01em'
               }}>
              {mode === 'login' ? 'BIENVENIDO' : 'CREA TU CUENTA'}
            </p>
            <p className="text-sm text-slate-300 font-light leading-relaxed"
               style={{
                 fontFamily: '"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif'
               }}>
              Accede a tu <span className="font-semibold text-emerald-400">ecosistema de inteligencia colectiva</span>
            </p>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-xl text-red-200 text-sm backdrop-blur-sm">
            {error}
          </div>
        )}

        {/* OAuth buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => handleOAuthLogin('microsoft')}
            className="w-full flex items-center justify-center gap-3 px-5 py-3.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 rounded-xl hover:from-blue-500/30 hover:to-purple-500/30 hover:border-white/40 hover:shadow-[0_10px_40px_rgba(99,102,241,0.3)] transition-all duration-300 font-semibold text-white shadow-lg backdrop-blur-md relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/10 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#f25022" d="M0 0h11.377v11.372H0z"/>
                <path fill="#00a4ef" d="M12.623 0H24v11.372H12.623z"/>
                <path fill="#7fba00" d="M0 12.628h11.377V24H0z"/>
                <path fill="#ffb900" d="M12.623 12.628H24V24H12.623z"/>
              </svg>
              Continuar con Microsoft
            </span>
          </button>

        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          <span className="text-sm text-slate-400 font-medium px-2">O con email</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre completo
              </label>
              <div className="relative group">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/30 via-emerald-400/20 to-cyan-400/30 opacity-60 group-focus-within:opacity-100 blur-xl transition-all duration-300"></div>
                <div className="absolute inset-[1px] rounded-2xl bg-slate-950/60 border border-white/10 backdrop-blur-xl shadow-[0_15px_60px_rgba(0,0,0,0.35)]"></div>
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300/80 z-10" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="relative z-10 w-full pl-12 pr-4 py-3.5 bg-transparent rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-0"
                  placeholder="Juan Pérez"
                  required
                />
                <div className="absolute -bottom-2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-emerald-400/60 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email
            </label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/25 via-emerald-400/15 to-sky-500/25 opacity-60 group-focus-within:opacity-100 blur-xl transition-all duration-300"></div>
              <div className="absolute inset-[1px] rounded-2xl bg-slate-950/65 border border-white/10 backdrop-blur-xl shadow-[0_15px_60px_rgba(0,0,0,0.35)]"></div>
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-300/80 z-10" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative z-10 w-full pl-12 pr-4 py-3.5 bg-transparent rounded-2xl text-white placeholder:text-slate-400 focus:outline-none focus:ring-0"
                placeholder="tu@email.com"
                required
              />
              <div className="absolute -bottom-2 left-8 right-8 h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Password
            </label>
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/25 via-teal-500/20 to-blue-500/25 opacity-60 group-focus-within:opacity-100 blur-xl transition-all duration-300"></div>
              <div className="absolute inset-[1px] rounded-2xl bg-slate-950/65 border border-white/10 backdrop-blur-xl shadow-[0_15px_60px_rgba(0,0,0,0.35)]"></div>
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300/80 z-10" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white py-3.5 rounded-xl font-bold hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:scale-105 active:scale-95"
          >
            {loading ? 'Cargando...' : (mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta')}
          </button>
        </form>

        {/* Toggle mode */}
        <div className="mt-8 text-center">
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold hover:underline transition-all duration-200"
          >
            {mode === 'login'
              ? '¿No tienes cuenta? Regístrate'
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>

        {/* Footer */}
        <div className="mt-10 pt-6 border-t border-white/10 text-center text-xs text-slate-400">
          Al continuar, aceptas nuestros{' '}
          <a href="/terms" target="_blank" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
            Términoss
          </a>{' '}
          y{' '}
          <a href="/privacy" target="_blank" className="text-emerald-400 hover:text-emerald-300 font-medium hover:underline transition-colors">
            Privacidad
          </a>
        </div>
      </div>
    </div>
  );
}


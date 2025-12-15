import { useState } from 'react';
import { z } from 'zod';
import { API_URL } from '../config/api';

export const loginSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'Mínimo 8 caracteres'),
});

export const registerSchema = loginSchema.extend({
    name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

interface User {
    id: string;
    email: string;
    name: string;
    tenantId?: string;
}

export const useAuthLogic = () => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [formState, setFormState] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(true);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validación con Zod
        const schema = mode === 'login' ? loginSchema : registerSchema;
        const result = schema.safeParse(formState);

        if (!result.success) {
            setError(result.error.issues[0]?.message ?? 'Datos inválidos');
            return;
        }

        setLoading(true);

        try {
            const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
            const body = mode === 'login'
                ? { email: formState.email, password: formState.password }
                : { email: formState.email, password: formState.password, name: formState.name };

            const response = await fetch(`${API_URL.replace('/api', '')}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
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

            // Limpiar del otro storage
            const otherStorage = rememberMe ? sessionStorage : localStorage;
            otherStorage.removeItem('econeura_token');
            otherStorage.removeItem('econeura_user');

            // Retornar token y user para que el componente los use
            return { token: data.token, user: data.user as User };
        } catch (err: unknown) {
            let errorMessage = 'Error de conexión';

            const error = err instanceof Error ? err : new Error(String(err));
            if (error.message) {
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
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider: 'google' | 'microsoft') => {
        window.location.href = `${API_URL.replace('/api', '')}/api/auth/${provider}`;
    };

    return {
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
    };
};

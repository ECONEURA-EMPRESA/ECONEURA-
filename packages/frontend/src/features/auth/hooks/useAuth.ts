import { useState, useCallback } from 'react';
import { getApiUrl } from '@/utils/apiUrl';

interface User {
    id: string;
    email: string;
    name: string;
    role: string;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

interface LoginResponse {
    success: boolean;
    token?: string;
    user?: User;
    message?: string;
}

/**
 * Hook personalizado para gestión de autenticación
 * @returns {Object} Estado y métodos de autenticación
 * @example
 * const { login, logout, isAuthenticated } = useAuth();
 * await login('user@example.com', 'password');
 */
export const useAuth = () => {
    const [state, setState] = useState<AuthState>(() => {
        // Recuperar del localStorage si existe
        const token = localStorage.getItem('auth_token');
        const userStr = localStorage.getItem('auth_user');
        const user = userStr ? JSON.parse(userStr) : null;

        return {
            user,
            token,
            isAuthenticated: !!token,
            isLoading: false,
            error: null,
        };
    });

    /**
     * Inicia sesión del usuario
     * @param email - Email del usuario
     * @param password - Contraseña del usuario
     * @returns Promise<boolean> - true si login exitoso
     */
    const login = useCallback(async (email: string, password: string): Promise<boolean> => {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            const response = await fetch(`${getApiUrl()}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data: LoginResponse = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || 'Error al iniciar sesión');
            }

            if (!data.token || !data.user) {
                throw new Error('Respuesta inválida del servidor');
            }

            // Guardar en localStorage
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('auth_user', JSON.stringify(data.user));

            setState({
                user: data.user,
                token: data.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            });

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';

            setState(prev => ({
                ...prev,
                isLoading: false,
                error: errorMessage,
            }));

            return false;
        }
    }, []);

    /**
     * Cierra la sesión del usuario
     */
    const logout = useCallback(() => {
        // Limpiar localStorage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');

        setState({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
        });
    }, []);

    /**
     * Actualiza el perfil del usuario
     * @param updates - Datos a actualizar
     */
    const updateUser = useCallback((updates: Partial<User>) => {
        setState(prev => {
            if (!prev.user) return prev;

            const updatedUser = { ...prev.user, ...updates };
            localStorage.setItem('auth_user', JSON.stringify(updatedUser));

            return {
                ...prev,
                user: updatedUser,
            };
        });
    }, []);

    return {
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        login,
        logout,
        updateUser,
    };
};

import { useState } from 'react';
import { z } from 'zod';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';
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
            // Safety check for Firebase Init - CAST TO ANY TO AVOID TS ERROR
            const safeAuth = auth as any;
            if (!safeAuth || !safeAuth.signInWithEmailAndPassword) {
                throw new Error('APP_CONFIG_ERROR: Firebase no está configurado. Revisa tu archivo .env');
            }

            let userCredential;
            if (mode === 'login') {
                userCredential = await signInWithEmailAndPassword(safeAuth, formState.email, formState.password);
            } else {
                userCredential = await createUserWithEmailAndPassword(safeAuth, formState.email, formState.password);
                // Optional: Update profile with name
                // await updateProfile(userCredential.user, { displayName: formState.name });
            }

            const firebaseUser = userCredential.user;
            const token = await firebaseUser.getIdToken();

            const user: User = {
                id: firebaseUser.uid,
                email: firebaseUser.email || '',
                name: firebaseUser.displayName || formState.name || 'Usuario',
            };

            // Guardar token según "Remember me"
            const storage = rememberMe ? localStorage : sessionStorage;
            storage.setItem('econeura_token', token);
            storage.setItem('econeura_user', JSON.stringify(user));

            // Limpiar del otro storage
            const otherStorage = rememberMe ? sessionStorage : localStorage;
            otherStorage.removeItem('econeura_token');
            otherStorage.removeItem('econeura_user');

            // Retornar token y user para que el componente los use
            return { token, user };
        } catch (err: unknown) {
            let errorMessage = 'Error de conexión';

            const error = err instanceof Error ? err : new Error(String(err));
            // Firebase Error Mapping
            if (error.message.includes('auth/invalid-credential') || error.message.includes('auth/user-not-found') || error.message.includes('auth/wrong-password')) {
                errorMessage = 'Email o contraseña incorrectos';
            } else if (error.message.includes('auth/email-already-in-use')) {
                errorMessage = 'Este email ya está registrado. ¿Quieres iniciar sesión?';
            } else if (error.message.includes('auth/weak-password')) {
                errorMessage = 'La contraseña es muy débil (mínimo 6 caracteres)';
            } else if (error.message.includes('auth/network-request-failed')) {
                errorMessage = 'Sin conexión a internet. Verifica tu red';
            } else {
                errorMessage = error.message;
            }

            setError(errorMessage);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthLogin = (provider: 'google') => {
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

import * as admin from 'firebase-admin';
import type { AuthService } from './ports';
import type { AuthContext } from '../../shared/types/auth';
import { logger } from '../../shared/logger';

export class FirebaseAuthService implements AuthService {
    constructor() {
        if (admin.apps.length === 0) {
            try {
                admin.initializeApp();
                logger.info('[FirebaseAuthService] Firebase Admin inicializado (ADC)');
            } catch (error) {
                logger.error('[FirebaseAuthService] Error inicializando Firebase Admin', { error });
            }
        }
    }

    async validateSession(token: string): Promise<AuthContext | null> {
        if (!token) return null;

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);

            // Mapear Custom Claims a roles internos
            // Si no tiene roles, asignamos 'user' por defecto para SaaS MVP
            const roles: string[] = Array.isArray(decodedToken.roles)
                ? decodedToken.roles
                : (decodedToken.role ? [decodedToken.role] : ['user']);

            // Tenant isolation: Idealmente viene en custom claims, si no, usamos el UID como fallback temporal
            const tenantId = (decodedToken.tenantId as string) || `tenant-${decodedToken.uid}`;

            return {
                userId: decodedToken.uid,
                tenantId,
                roles,
                sessionId: `sess-${Date.now()}` // Firebase tokens son stateless/short-lived
            };
        } catch (error) {
            logger.warn('[FirebaseAuthService] Token inválido', {
                error: error instanceof Error ? error.message : String(error)
            });
            return null;
        }
    }

    // Login/Register no se implementan en backend con Firebase Auth (se hacen en cliente)
    // Pero mantenemos la interfaz por compatibilidad
    async login(): Promise<void> {
        throw new Error('Login must be performed on client side with Firebase SDK');
    }

    async register(): Promise<void> {
        throw new Error('Register must be performed on client side with Firebase SDK');
    }
}

export const firebaseAuthService = new FirebaseAuthService();

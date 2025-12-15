import type { AuthService } from './ports';
import type { AuthContext } from '../../shared/types/auth';
import { ok, err, type Result } from '../../shared/Result';

/**
 * Implementación stub de AuthService:
 * - Acepta cualquier token no vacío.
 * - Asigna tenant y roles fijos de desarrollo.
 * - Sólo para entorno dev/test; en prod se reemplazará por Entra ID u otro provider real.
 */
export class DevAuthService implements AuthService {
  // Simulación de base de datos en memoria (solo para desarrollo)
  private users: Map<string, { email: string; password: string; name: string }> = new Map();

  constructor() {
    // ✅ SEED: Usuario por defecto para facilitar el login
    this.users.set('admin@econeura.com', {
      email: 'admin@econeura.com',
      password: 'admin123', // Cumple con length >= 6
      name: 'Administrador'
    });
  }

  async validateSession(token: string): Promise<AuthContext | null> {
    if (!token) {
      return null;
    }

    // En dev, aceptamos cualquier token y devolvemos un contexto fijo.
    return {
      userId: 'dev-user',
      tenantId: 'dev-tenant',
      roles: ['admin'],
      sessionId: 'dev-session'
    };
  }

  /**
   * Login de usuario (stub para desarrollo)
   */
  async login(
    email: string,
    password: string
  ): Promise<Result<{ token: string; user: { id: string; email: string; name: string } }, Error>> {
    // En desarrollo, aceptamos cualquier email/password válido
    // Si el usuario existe, validamos password; si no, creamos uno automáticamente
    const user = this.users.get(email.toLowerCase());

    if (user) {
      // Usuario existe, validar password (en dev, cualquier password >= 6 caracteres funciona)
      if (password.length < 6) {
        return err(new Error('Invalid credentials'));
      }

      const token = this.generateToken(email);
      return ok({
        token,
        user: {
          id: `user-${email.toLowerCase().replace('@', '-').replace('.', '-')}`,
          email: user.email,
          name: user.name
        }
      });
    }

    // Usuario no existe, crear automáticamente (solo en dev)
    if (password.length < 6) {
      return err(new Error('Password must be at least 6 characters'));
    }

    const newUser = {
      email: email.toLowerCase(),
      password, // En producción, esto debería ser un hash
      name: email.split('@')[0] || 'Usuario'
    };

    this.users.set(email.toLowerCase(), newUser);

    const token = this.generateToken(email);
    return ok({
      token,
      user: {
        id: `user-${email.toLowerCase().replace('@', '-').replace('.', '-')}`,
        email: newUser.email,
        name: newUser.name
      }
    });
  }

  /**
   * Registro de usuario (stub para desarrollo)
   */
  async register(
    email: string,
    password: string,
    name: string
  ): Promise<Result<{ token: string; user: { id: string; email: string; name: string } }, Error>> {
    const emailLower = email.toLowerCase();

    // Verificar si usuario ya existe
    if (this.users.has(emailLower)) {
      return err(new Error('Email already exists'));
    }

    // Validar password
    if (password.length < 6) {
      return err(new Error('Password must be at least 6 characters'));
    }

    // Crear usuario
    const newUser = {
      email: emailLower,
      password, // En producción, esto debería ser un hash
      name
    };

    this.users.set(emailLower, newUser);

    const token = this.generateToken(email);
    return ok({
      token,
      user: {
        id: `user-${emailLower.replace('@', '-').replace('.', '-')}`,
        email: newUser.email,
        name: newUser.name
      }
    });
  }

  /**
   * Generar token simple (solo para desarrollo)
   */
  private generateToken(email: string): string {
    const payload = {
      email: email.toLowerCase(),
      userId: `user-${email.toLowerCase().replace('@', '-').replace('.', '-')}`,
      tenantId: 'dev-tenant',
      roles: ['admin'],
      iat: Date.now()
    };

    // En desarrollo, simplemente codificamos el payload en base64
    // En producción, usar JWT con firma
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }
}

export const devAuthService = new DevAuthService();



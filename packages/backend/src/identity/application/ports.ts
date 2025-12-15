import type { AuthContext } from '../../shared/types/auth';

export interface AuthService {
  validateSession(token: string): Promise<AuthContext | null>;
}

export interface TokenService {
  issueToken(context: AuthContext): Promise<string>;
}



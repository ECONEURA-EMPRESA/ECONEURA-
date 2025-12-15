export interface User {
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'user' | 'viewer';
    avatar?: string;
    createdAt: string;
    lastLogin?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterCredentials extends LoginCredentials {
    name: string;
    confirmPassword: string;
}

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: User;
    message?: string;
    expiresIn?: number;
}

export interface AuthError {
    code: string;
    message: string;
    field?: string;
}

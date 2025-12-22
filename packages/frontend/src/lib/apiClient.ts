
import { API_URL } from '../config/api';

interface RequestOptions extends RequestInit {
    token?: string;
}

class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private getHeaders(options: RequestOptions = {}): HeadersInit {
        const headers: any = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        const token = options.token || localStorage.getItem('econeura_token') || localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        return headers;
    }

    async request<T = any>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
        const headers = this.getHeaders(options);

        try {
            const res = await fetch(url, {
                ...options,
                headers,
            });

            if (res.status === 401) {
                // Optional: Handle logout or refresh token here
                console.warn('Unauthorized access. Session might be expired.');
            }

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error(errorData.message || `API Error ${res.status}: ${res.statusText}`);
            }

            // Return null for 204 No Content
            if (res.status === 204) {
                return null as any;
            }

            return await res.json();
        } catch (error) {
            throw error;
        }
    }

    async get<T = any>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: 'GET' });
    }

    async post<T = any>(endpoint: string, body: any, options?: RequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(body),
        });
    }

    async put<T = any>(endpoint: string, body: any, options?: RequestOptions) {
        return this.request<T>(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(body),
        });
    }

    async delete<T = any>(endpoint: string, options?: RequestOptions) {
        return this.request<T>(endpoint, { ...options, method: 'DELETE' });
    }
}

export const apiClient = new ApiClient(API_URL);

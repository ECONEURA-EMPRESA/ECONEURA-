/**
 * ECONEURA - Frontend Auth Utility
 * Enterprise-grade JWT authentication with auto-refresh
 */

import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  userId: string;
  email: string;
  name: string;
  role: string;
  exp: number;
  iat: number;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

// Storage keys
const ACCESS_TOKEN_KEY = 'econeura_access_token';
const REFRESH_TOKEN_KEY = 'econeura_refresh_token';
const USER_KEY = 'econeura_user';

// Auto-refresh timer
let refreshTimer: number | null = null;

/**
 * Store auth tokens and user info
 */
export function setAuthTokens(tokens: TokenPair): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

  // Decode and store user info
  const decoded = jwtDecode<DecodedToken>(tokens.accessToken);
  const user: User = {
    id: decoded.userId,
    email: decoded.email,
    name: decoded.name,
    role: decoded.role
  };
  localStorage.setItem(USER_KEY, JSON.stringify(user));

  // Setup auto-refresh
  setupAutoRefresh(tokens.expiresIn);
}

/**
 * Get access token
 */
export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

/**
 * Get refresh token
 */
export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const now = Date.now() / 1000;
    return decoded.exp > now;
  } catch {
    return false;
  }
}

/**
 * Get token expiration time
 */
export function getTokenExpiration(): number | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const decoded = jwtDecode<DecodedToken>(token);
    return decoded.exp * 1000; // Convert to milliseconds
  } catch {
    return null;
  }
}

/**
 * Check if token is about to expire (within 2 minutes)
 */
export function isTokenExpiringSoon(): boolean {
  const expiration = getTokenExpiration();
  if (!expiration) return true;

  const now = Date.now();
  const twoMinutes = 2 * 60 * 1000;
  return expiration - now < twoMinutes;
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(): Promise<boolean> {
  try {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    setAuthTokens(data);

    // Token refreshed - logging removed
    return true;
  } catch (error) {
    console.error('[Auth] Token refresh error:', error);
    clearAuth();
    return false;
  }
}

/**
 * Setup automatic token refresh
 */
function setupAutoRefresh(expiresIn: number): void {
  // Clear existing timer
  if (refreshTimer) {
    clearTimeout(refreshTimer);
  }

  // Refresh 2 minutes before expiration
  const refreshTime = (expiresIn - 120) * 1000; // Convert to milliseconds

  if (refreshTime > 0) {
    refreshTimer = window.setTimeout(() => {
      // Auto-refreshing token - logging removed
      refreshAccessToken();
    }, refreshTime);
  }
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    const refreshToken = getRefreshToken();
    const accessToken = getAccessToken();

    if (refreshToken && accessToken) {
      // Call backend to revoke token
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ refreshToken })
      }).catch(() => {
        // Ignore errors, clear local storage anyway
      });
    }
  } finally {
    clearAuth();
  }
}

/**
 * Clear authentication data
 */
export function clearAuth(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);

  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

/**
 * Get Authorization header value
 */
export function getAuthHeader(): string | null {
  const token = getAccessToken();
  return token ? `Bearer ${token}` : null;
}

/**
 * Check if user has role
 */
export function hasRole(role: string): boolean {
  const user = getCurrentUser();
  return user?.role === role;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  return hasRole('admin');
}

/**
 * Initialize auth (call on app start)
 */
export function initAuth(): void {
  // Check if token exists and is valid
  if (isAuthenticated()) {
    // Setup auto-refresh
    const token = getAccessToken();
    if (token) {
      try {
        const decoded = jwtDecode<DecodedToken>(token);
        const now = Math.floor(Date.now() / 1000);
        const expiresIn = decoded.exp - now;
        setupAutoRefresh(expiresIn);
      } catch {
        clearAuth();
      }
    }
  } else {
    // Clear invalid/expired auth
    clearAuth();
  }
}

/**
 * Handle OAuth callback
 */
export function handleOAuthCallback(params: URLSearchParams): boolean {
  const accessToken = params.get('accessToken');
  const refreshToken = params.get('refreshToken');
  const expiresIn = params.get('expiresIn');

  if (accessToken && refreshToken && expiresIn) {
    const tokens: TokenPair = {
      accessToken,
      refreshToken,
      expiresIn: parseInt(expiresIn),
      tokenType: 'Bearer'
    };

    setAuthTokens(tokens);
    return true;
  }

  return false;
}

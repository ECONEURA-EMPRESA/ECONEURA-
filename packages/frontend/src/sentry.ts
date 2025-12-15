import * as Sentry from "@sentry/react";

export function initSentry() {
  const isProd = (import.meta as any).env?.PROD;
  const dsn = (import.meta as any).env?.VITE_SENTRY_DSN;
  const environment = (import.meta as any).env?.MODE || 'production';

  // Si no hay DSN, no inicializar pero no es error
  if (!dsn) {
    // Silenciar en desarrollo - no es un error
    // if (isProd) {
    //   console.warn('⚠️ Sentry not configured in production (VITE_SENTRY_DSN not set)');
    // } else {
    //   console.log('ℹ️ Sentry not configured (VITE_SENTRY_DSN not set) - Development mode');
    // }
    return false;
  }

  try {
    Sentry.init({
      dsn,

      // Integrations
      integrations: [
        // Browser Tracing para performance monitoring
        Sentry.browserTracingIntegration({
          tracePropagationTargets: [
            "localhost",
            /^https:\/\/.*\.web\.app/,
            /^https:\/\/.*\.firebaseapp\.com/,
            /^https:\/\/api\.econeura\.com/,
          ],
        } as any),

        // Session Replay para debugging
        Sentry.replayIntegration({
          maskAllText: false,
          blockAllMedia: false,
        }),

        // Breadcrumbs para contexto
        Sentry.breadcrumbsIntegration({
          console: true,
          dom: true,
          fetch: true,
          history: true,
          sentry: true,
          xhr: true,
        }),
      ],

      // Performance Monitoring
      tracesSampleRate: isProd ? 0.1 : 1.0, // 10% en prod, 100% en dev

      // Session Replay
      replaysSessionSampleRate: 0.1, // 10% of normal sessions
      replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors

      // Environment
      environment,

      // Release tracking (GitHub SHA)
      release: (import.meta as any).env?.VITE_GITHUB_SHA || 'local',

      // Error filtering
      beforeSend(event, hint) {
        // Filtrar errores conocidos/esperados
        const error = hint.originalException;

        if (error && typeof error === 'object' && 'message' in error) {
          const message = String(error.message);

          // No reportar errores de red esperados
          if (message.includes('Failed to fetch')) {
            return null;
          }

          // No reportar errores de navegación
          if (message.includes('ChunkLoadError')) {
            return null;
          }

          // No reportar errors de React en development
          if (!isProd && message.includes('Warning:')) {
            return null;
          }
        }

        return event;
      },

      // Tags adicionales
      initialScope: {
        tags: {
          service: 'web-frontend',
          runtime: 'browser',
        },
      },
    });

    console.log(`✅ Sentry initialized (${environment})`);
    return true;
  } catch (error) {
    console.error('❌ Failed to initialize Sentry:', error);
    return false;
  }
}

/**
 * Capturar error manualmente
 */
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Capturar mensaje
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = 'info', context?: Record<string, any>) {
  Sentry.withScope((scope) => {
    if (context) {
      Object.entries(context).forEach(([key, value]) => {
        scope.setContext(key, value);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * Set user context
 */
export function setUser(user: { id: string; email?: string; username?: string }) {
  Sentry.setUser(user);
}

/**
 * Clear user context
 */
export function clearUser() {
  Sentry.setUser(null);
}


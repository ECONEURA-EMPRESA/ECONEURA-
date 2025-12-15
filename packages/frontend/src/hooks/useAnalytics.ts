import { useEffect, useCallback } from 'react';

/**
 * Event types para analytics
 */
type AnalyticsEvent =
  | 'page_view'
  | 'login'
  | 'logout'
  | 'agent_execute'
  | 'chat_open'
  | 'chat_message'
  | 'search'
  | 'department_change'
  | 'dark_mode_toggle'
  | 'error';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

/**
 * Hook para analytics
 * Integra con Vercel Analytics y custom events
 */
export function useAnalytics() {
  useEffect(() => {
    // Registrar page view automáticamente
    trackEvent('page_view', {
      path: window.location.pathname,
      referrer: document.referrer,
      timestamp: Date.now()
    });
  }, []);

  const trackEvent = useCallback((
    event: AnalyticsEvent,
    properties?: AnalyticsProperties
  ) => {
    // Enviar a Vercel Analytics
    if (typeof window !== 'undefined' && 'va' in window) {
      // @ts-ignore
      window.va?.('event', event, properties);
    }

    // Enviar a Google Analytics (si está configurado)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      // @ts-ignore
      window.gtag?.('event', event, properties);
    }

    // Log solo en desarrollo (será removido en producción por Vite)
    if (import.meta.env.DEV) {
      if (import.meta.env.DEV) {
         
        console.log('📊 Analytics:', event, properties);
      }
    }

    // Custom tracking (puedes integrar con Mixpanel, Amplitude, etc.)
    if (import.meta.env.PROD) {
      // window.mixpanel?.track(event, properties);
      // window.amplitude?.logEvent(event, properties);
    }
  }, []);

  const trackPageView = useCallback((path: string) => {
    trackEvent('page_view', { path });
  }, [trackEvent]);

  const trackLogin = useCallback((method: 'email' | 'oauth') => {
    trackEvent('login', { method });
  }, [trackEvent]);

  const trackLogout = useCallback(() => {
    trackEvent('logout', {});
  }, [trackEvent]);

  const trackAgentExecution = useCallback((agentId: string, deptId: string) => {
    trackEvent('agent_execute', { agentId, deptId });
  }, [trackEvent]);

  const trackChatMessage = useCallback((length: number, role: 'user' | 'assistant') => {
    trackEvent('chat_message', { length, role });
  }, [trackEvent]);

  const trackSearch = useCallback((query: string, resultsCount: number) => {
    trackEvent('search', { query, resultsCount });
  }, [trackEvent]);

  const trackError = useCallback((error: string, component?: string) => {
    trackEvent('error', { error, component });
  }, [trackEvent]);

  return {
    trackEvent,
    trackPageView,
    trackLogin,
    trackLogout,
    trackAgentExecution,
    trackChatMessage,
    trackSearch,
    trackError
  };
}

/**
 * Identificar usuario para analytics
 */
export function identifyUser(userId: string, properties?: AnalyticsProperties) {
  if (typeof window !== 'undefined' && 'va' in window) {
    // @ts-ignore
    window.va?.('identify', userId, properties);
  }

  // Log solo en desarrollo (será removido en producción por Vite)
  if (import.meta.env.DEV) {
     
    console.log('👤 User identified:', userId, properties);
  }
}

/**
 * Performance monitoring
 */
export function trackPerformance(metric: string, value: number) {
  if (typeof window !== 'undefined' && 'va' in window) {
    // @ts-ignore
    window.va?.('event', 'performance', { metric, value });
  }

  // Log solo en desarrollo (será removido en producción por Vite)
  if (import.meta.env.DEV) {
     
    console.log(`⚡ Performance - ${metric}:`, value);
  }
}


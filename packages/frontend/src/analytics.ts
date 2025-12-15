// Analytics Service
// Tracks pageviews and custom events

export function initAnalytics() {
  // Inicialización de Analytics (Google Analytics 4 / PostHog, etc)
}

export function trackEvent(eventName: string, properties?: Record<string, any>) {
  // En producción, aquí conectaríamos con GA4 o similar
  if (process.env.NODE_ENV === 'development') {
    console.debug(`[Analytics] Track: ${eventName}`, properties);
  }
}

// Custom events for ECONEURA
export const analytics = {
  chatSent: (neuraId: string, inputLength: number) => {
    trackEvent('chat_sent', { neura_id: neuraId, input_length: inputLength });
  },

  neuraSelected: (neuraId: string) => {
    trackEvent('neura_selected', { neura_id: neuraId });
  },

  errorOccurred: (errorType: string, message: string) => {
    trackEvent('error', { error_type: errorType, message });
  },

  agentExecuted: (agentId: string, provider: string) => {
    trackEvent('agent_executed', { agent_id: agentId, provider });
  },

  multiActorStarted: (neurasCount: number) => {
    trackEvent('multi_actor_started', { neuras_count: neurasCount });
  }
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    appInsights?: {
      trackEvent: (event: { name: string }, properties?: any) => void;
      trackPageView: (pageView?: any) => void;
    };
  }
}

/**
 * Utilidades de monitoring y observabilidad
 */

interface MonitoringEvent {
  type: 'error' | 'warning' | 'info' | 'performance';
  message: string;
  metadata?: Record<string, unknown>;
  timestamp: number;
}

/**
 * Logger centralizado con niveles
 */
class Logger {
  private events: MonitoringEvent[] = [];
  private maxEvents = 100;

  log(type: MonitoringEvent['type'], message: string, metadata?: Record<string, unknown>) {
    const event: MonitoringEvent = {
      type,
      message,
      metadata,
      timestamp: Date.now()
    };

    this.events.push(event);

    // Mantener solo los últimos N eventos
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }

    // Log en consola solo en desarrollo
    if (import.meta.env.DEV) {
      const emoji = type === 'error' ? '❌' : type === 'warning' ? '⚠️' : type === 'performance' ? '⚡' : 'ℹ️';
       
      console.log(`${emoji} [${type.toUpperCase()}]`, message, metadata || '');
    }

    // Enviar a servicio de monitoring en producción
    if (import.meta.env.PROD && (type === 'error' || type === 'warning')) {
      this.sendToMonitoring(event);
    }
  }

  error(message: string, metadata?: Record<string, unknown>) {
    this.log('error', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>) {
    this.log('warning', message, metadata);
  }

  info(message: string, metadata?: Record<string, unknown>) {
    this.log('info', message, metadata);
  }

  performance(message: string, duration: number, metadata?: Record<string, unknown>) {
    this.log('performance', message, { ...metadata, duration });
  }

  private sendToMonitoring(event: MonitoringEvent) {
    // Integración con Sentry
    if (typeof window !== 'undefined' && 'Sentry' in window) {
      // @ts-ignore
      window.Sentry?.captureMessage(event.message, {
        level: event.type === 'error' ? 'error' : 'warning',
        extra: event.metadata
      });
    }

    // Integración con endpoint custom
    const endpoint = import.meta.env.VITE_MONITORING_ENDPOINT;
    if (endpoint) {
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }).catch(() => {
        // Silenciar errores de monitoring
      });
    }
  }

  getEvents(): MonitoringEvent[] {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }
}

// Instancia singleton
export const logger = new Logger();

/**
 * Monitor de recursos (memory, CPU usage aproximado)
 */
export function monitorResources() {
  if ('performance' in window && 'memory' in performance) {
    // @ts-ignore
    const memory = (performance as any).memory;

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };
  }

  return null;
}

/**
 * Monitor de performance de navegación
 */
export function getNavigationTiming() {
  const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

  if (!perfData) return null;

  return {
    dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcpTime: perfData.connectEnd - perfData.connectStart,
    requestTime: perfData.responseStart - perfData.requestStart,
    responseTime: perfData.responseEnd - perfData.responseStart,
    domParseTime: perfData.domInteractive - perfData.responseEnd,
    domContentLoadedTime: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
    loadTime: perfData.loadEventEnd - perfData.loadEventStart,
    totalTime: perfData.loadEventEnd - perfData.fetchStart
  };
}

/**
 * Detectar rage clicks (usuario frustrado)
 */
export function detectRageClicks(element: HTMLElement, callback: () => void) {
  let clickCount = 0;
  let timer: ReturnType<typeof setTimeout>;

  element.addEventListener('click', () => {
    clickCount++;

    clearTimeout(timer);

    if (clickCount >= 5) {
      logger.warn('Rage click detected', { element: element.tagName });
      callback();
      clickCount = 0;
    }

    timer = setTimeout(() => {
      clickCount = 0;
    }, 1000);
  });
}

/**
 * Capturar errores globales no manejados
 */
export function setupGlobalErrorHandling() {
  // Capturar errores de JavaScript
  window.addEventListener('error', (event) => {
    logger.error('Unhandled error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  // Capturar promesas rechazadas no manejadas
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', {
      reason: String(event.reason)
    });
  });
}


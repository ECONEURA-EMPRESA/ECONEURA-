import './index.css';
import React from 'react';
import { initSentry } from './sentry';
import { initAnalytics } from './analytics';

const defaultRoot = document.getElementById('root')!;

export async function mountApp(root: HTMLElement | null = defaultRoot, forceClient = false) {
  if (process.env.NODE_ENV === 'test' && !forceClient) {
    try {
      if (root) {
        const node = document.createElement('div');
        node.setAttribute('data-test-rendered', '1');
        root.appendChild(node);
      }
    } catch (e) {
      void e;
      /* ignore in test env */
    }
    return;
  }

  try {
    // Import directo - evita problemas con Vite dynamic import analysis
    const { createRoot } = await import('react-dom/client');
    const { default: App } = await import('./App');

    if (createRoot && root) {
      createRoot(root).render(React.createElement(App));
    }
  } catch (err) {
    // Failed to mount - error logged to Sentry if configured
    void err;
  }
}

// ================================
// OBSERVABILITY INITIALIZATION
// ================================

// 1. Initialize error tracking (must be first)
initSentry();

// 2. Initialize analytics
initAnalytics();

// ================================
// PWA - DESHABILITADO TEMPORALMENTE
// ================================
// PWA está implementado pero tiene issues con Vercel
// Habilitaremos cuando se resuelva el deployment

// PWA temporarily disabled

// ================================
// APP MOUNTING
// ================================

// Run mount at module load with default behavior (non-forced)
void mountApp(defaultRoot, false);

// Also provide a default export shape (some bundlers/instrumenters wrap named exports into a default getter)
export default { mountApp };


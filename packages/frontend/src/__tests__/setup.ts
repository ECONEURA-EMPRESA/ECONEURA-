import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Global Mocks
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock fetch globally
global.fetch = vi.fn();

import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import React from 'react';

// Cleanup after each test
afterEach(() => {
  vi.clearAllTimers();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  cleanup();
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
(global as any).IntersectionObserver = class IntersectionObserver {
  constructor() { }
  disconnect() { }
  observe() { }
  takeRecords() { return []; }
  unobserve() { }
} as any;

// Suppress console errors in tests
(global as any).console = {
  ...console,
  error: vi.fn(),
  warn: vi.fn(),
};

// Mock React JSX
(global as any).React = React;

// Mock jsxDEV and jsx functions for React 18
(global as any).jsxDEV = React.createElement;
(global as any).jsx = React.createElement;

// Mock React.createElement for compatibility
(global as any).React.createElement = React.createElement;

// Mock window for tests
(global as any).window = window;
(global as any).document = document;

// Ensure window is available globally
if (typeof (global as any).window === 'undefined') {
  (global as any).window = window;
}

if (typeof (global as any).document === 'undefined') {
  (global as any).document = document;
}

// Mock React.createElement globally
(global as any).createElement = React.createElement;

// Ensure jsxDEV is available globally
if (typeof (global as any).jsxDEV !== 'function') {
  (global as any).jsxDEV = React.createElement;
}

// Mock React.createElement for JSX
if (typeof (global as any).React.createElement !== 'function') {
  (global as any).React.createElement = React.createElement;
}

// Mock jsxDEV globally for all tests
Object.defineProperty(global, 'jsxDEV', {
  value: React.createElement,
  writable: true,
  configurable: true
});

// Mock jsx globally for all tests
Object.defineProperty(global, 'jsx', {
  value: React.createElement,
  writable: true,
  configurable: true
});

// Mock color utilities to prevent test failures
vi.mock('../utils/colors', () => ({
  hexToRgb: (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  },
  rgba: (hex: string, alpha: number) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0,0,0,${alpha})`;
    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
}));
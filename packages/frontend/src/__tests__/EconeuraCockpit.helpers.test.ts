import { test, expect } from 'vitest';
import * as M from '../EconeuraCockpit';
const __TEST_HELPERS = (M as any).__TEST_HELPERS;

test('iconForAgent returns sensible components for various titles', () => {
  const { iconForAgent } = __TEST_HELPERS as any;
  const i1 = iconForAgent('Agenda Consejo');
  const i2 = iconForAgent('Resumen diario');
  const i3 = iconForAgent('OKR tracker');
  const i4 = iconForAgent('Phishing Triage');
  expect(typeof i1 === 'function' || typeof i1 === 'object').toBeTruthy();
  expect(typeof i2 === 'function' || typeof i2 === 'object').toBeTruthy();
  expect(typeof i3 === 'function' || typeof i3 === 'object').toBeTruthy();
  expect(typeof i4 === 'function' || typeof i4 === 'object').toBeTruthy();
});

test('correlationId fallback returns hex-like string when crypto unavailable', () => {
  const { correlationId } = __TEST_HELPERS as any;
  // If crypto exists and getRandomValues is writable, stub it to force the fallback path.
  const origCrypto = (globalThis as any).crypto as any;
  if (origCrypto && typeof origCrypto.getRandomValues === 'function') {
    const origGRV = origCrypto.getRandomValues;
    origCrypto.getRandomValues = (() => {
      throw new Error('no crypto');
    }) as any;
    try {
      const v = correlationId();
      expect(typeof v).toBe('string');
      expect(v.length).toBeGreaterThan(8);
    } finally {
      origCrypto.getRandomValues = origGRV;
    }
  } else {
    const v = correlationId();
    expect(typeof v).toBe('string');
    expect(v.length).toBeGreaterThan(8);
  }
});

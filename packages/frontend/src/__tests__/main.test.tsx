import { test, expect } from 'vitest';

test('main renders without crashing in test-mode', async () => {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);

  const mod: any = await import('../main');
  // Diagnostic: show what the module actually exports in the test environment

  console.log('DEBUG: main exports', Object.keys(mod));

  const resolveMount = (m: any) => {
    if (!m) return undefined;
    // direct named export
    if (typeof m.mountApp === 'function') return m.mountApp;
    // default might hold the exports
    if (m.default) {
      if (typeof m.default.mountApp === 'function') return m.default.mountApp;
      // function may have a mountApp property
      if (typeof m.default === 'function' && typeof (m.default as any).mountApp === 'function')
        return (m.default as any).mountApp;
      // nested default
      if (m.default.default && typeof m.default.default.mountApp === 'function')
        return m.default.default.mountApp;
    }
    // scan properties
    try {
      for (const k of Object.keys(m)) {
        const v = m[k];
        if (v && typeof v.mountApp === 'function') return v.mountApp;
      }
    } catch (e) {
      void e;
      // ignore
    }
    return undefined;
  };

  const mountApp = resolveMount(mod);
  if (typeof mountApp !== 'function') {
    console.log('DEBUG: main module shape', mod);
    throw new Error('mountApp not exported');
  }
  await mountApp(root, false);
  expect(root.querySelector('[data-test-rendered]')).toBeTruthy();
});
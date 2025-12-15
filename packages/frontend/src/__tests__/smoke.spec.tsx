// Direct imports not required; we assert dynamic import presence below

describe('smoke', () => {
  it('exports App and EconeuraCockpit', async () => {
    const modA = await import('../App');
    const modB = await import('../EconeuraCockpit');
    expect(modA.default).toBeDefined();
    expect(modB.default).toBeDefined();
  });
});
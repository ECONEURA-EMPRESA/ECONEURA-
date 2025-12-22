import { getNeuraById, neuraCatalog } from '../../src/neura/neuraCatalog';

describe('neuraCatalog', () => {
  it('debe devolver una NEURA válida por id', () => {
    expect(neuraCatalog.length).toBeGreaterThan(0);
    const anyNeura = neuraCatalog[0]!;
    const result = getNeuraById(anyNeura.id);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(anyNeura.id);
    }
  });

  it('debe devolver error si la NEURA no existe', () => {
    // Pasando ID inválido para probar validación en runtime (TS no se queja si es string)
    const result = getNeuraById('neura-no-existe');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeInstanceOf(Error);
    }
  });
});



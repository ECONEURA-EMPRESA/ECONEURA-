"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neuraCatalog_1 = require("../../src/neura/neuraCatalog");
describe('neuraCatalog', () => {
    it('debe devolver una NEURA válida por id', () => {
        expect(neuraCatalog_1.neuraCatalog.length).toBeGreaterThan(0);
        const anyNeura = neuraCatalog_1.neuraCatalog[0];
        const result = (0, neuraCatalog_1.getNeuraById)(anyNeura.id);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.id).toBe(anyNeura.id);
        }
    });
    it('debe devolver error si la NEURA no existe', () => {
        // @ts-expect-error id inválido a propósito para el test
        const result = (0, neuraCatalog_1.getNeuraById)('neura-no-existe');
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeInstanceOf(Error);
        }
    });
});

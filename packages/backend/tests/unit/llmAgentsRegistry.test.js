"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const llmAgentsRegistry_1 = require("../../src/llm/llmAgentsRegistry");
describe('llmAgentsRegistry', () => {
    it('debe devolver un agente válido por id', () => {
        expect(llmAgentsRegistry_1.llmAgents.length).toBeGreaterThan(0);
        const anyAgent = llmAgentsRegistry_1.llmAgents[0];
        const result = (0, llmAgentsRegistry_1.getLLMAgent)(anyAgent.id);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.id).toBe(anyAgent.id);
        }
    });
    it('debe devolver error si el agente no existe', () => {
        const result = (0, llmAgentsRegistry_1.getLLMAgent)('agente-inexistente');
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(typeof result.error).toBe('string');
        }
    });
});

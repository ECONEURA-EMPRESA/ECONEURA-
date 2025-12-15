"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const automationAgentsRegistry_1 = require("../../src/automation/automationAgentsRegistry");
describe('automationAgentsRegistry', () => {
    it('debe tener agentes registrados para todas las NEURAS clave', () => {
        const keys = new Set(automationAgentsRegistry_1.automationAgents.map((a) => a.neuraKey));
        expect(keys.has('ceo')).toBe(true);
        expect(keys.has('ia')).toBe(true);
        expect(keys.has('cso')).toBe(true);
        expect(keys.has('cto')).toBe(true);
        expect(keys.has('ciso')).toBe(true);
        expect(keys.has('coo')).toBe(true);
        expect(keys.has('chro')).toBe(true);
        expect(keys.has('cmo')).toBe(true);
        expect(keys.has('cfo')).toBe(true);
        expect(keys.has('cdo')).toBe(true);
        expect(keys.has('cino')).toBe(true);
    });
    it('debe devolver agentes activos por neuraKey', () => {
        const ceoAgents = (0, automationAgentsRegistry_1.getAutomationAgentsByNeuraKey)('ceo');
        expect(ceoAgents.length).toBeGreaterThan(0);
        for (const agent of ceoAgents) {
            expect(agent.active).toBe(true);
            expect(agent.neuraKey).toBe('ceo');
        }
    });
    it('debe devolver un agente por id', () => {
        const anyAgent = automationAgentsRegistry_1.automationAgents[0];
        const result = (0, automationAgentsRegistry_1.getAutomationAgentById)(anyAgent.id);
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.id).toBe(anyAgent.id);
        }
    });
    it('debe devolver error si el agente no existe', () => {
        const result = (0, automationAgentsRegistry_1.getAutomationAgentById)('agente-inexistente');
        expect(result.success).toBe(false);
    });
});

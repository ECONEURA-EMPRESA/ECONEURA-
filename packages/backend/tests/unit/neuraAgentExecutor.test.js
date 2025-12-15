"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const neuraAgentExecutor_1 = require("../../src/automation/neuraAgentExecutor");
jest.mock('../../src/automation/automationService', () => ({
    automationService: {
        executeByAgentId: jest.fn().mockResolvedValue({
            success: true,
            data: {
                agentId: 'ceo-agenda-consejo',
                neuraKey: 'ceo',
                neuraId: 'a-ceo-01',
                mode: 'mock',
                provider: 'make',
                status: 'completed',
                data: {
                    executionId: 'mock-123',
                    platform: 'make'
                }
            }
        })
    }
}));
describe('neuraAgentExecutor', () => {
    it('detectAgentIntent debe detectar un agente cuando el mensaje lo contiene', () => {
        const intent = (0, neuraAgentExecutor_1.detectAgentIntent)('ejecuta Agenda Consejo para la próxima semana', 'ceo');
        expect(intent).not.toBeNull();
        if (intent) {
            expect(intent.detected).toBe(true);
            expect(intent.agentId).toBe('ceo-agenda-consejo');
        }
    });
    it('detectAgentIntent devuelve null cuando no hay intención de ejecución', () => {
        const intent = (0, neuraAgentExecutor_1.detectAgentIntent)('hola, cómo estás', 'ceo');
        expect(intent).toBeNull();
    });
    it('executeNeuraAgentFromChat devuelve mensaje de ayuda cuando no hay agente detectado', async () => {
        const result = await (0, neuraAgentExecutor_1.executeNeuraAgentFromChat)('hola, sin palabras clave', {
            neuraKey: 'ceo',
            neuraId: 'a-ceo-01'
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.success).toBe(false);
            expect(result.data.message).toContain('No he detectado ningún agente');
        }
    });
    it('executeNeuraAgentFromChat ejecuta el servicio cuando hay intención detectada', async () => {
        const result = await (0, neuraAgentExecutor_1.executeNeuraAgentFromChat)('ejecuta Agenda Consejo', {
            neuraKey: 'ceo',
            neuraId: 'a-ceo-01',
            userId: 'user-123',
            correlationId: 'corr-123'
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.success).toBe(true);
            expect(result.data.message).toContain('Agenda Consejo');
        }
    });
});

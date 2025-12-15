"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const automationService_1 = require("../../src/automation/automationService");
const automationAgentsRegistry_1 = require("../../src/automation/automationAgentsRegistry");
// Mock de adaptadores para no llamar a Make/n8n reales
jest.mock('../../src/infra/automation/MakeAdapter', () => ({
    makeAdapter: {
        executeWebhook: jest.fn().mockResolvedValue({
            success: true,
            data: {
                data: { ok: true }
            }
        })
    }
}));
jest.mock('../../src/infra/automation/N8NAdapter', () => ({
    n8nAdapter: {
        executeWebhook: jest.fn().mockResolvedValue({
            success: true,
            data: {
                data: { ok: true }
            }
        })
    }
}));
describe('automationService', () => {
    it('debe ejecutar en modo mock cuando no hay webhook configurado', async () => {
        const agentWithoutWebhook = automationAgentsRegistry_1.automationAgents.find((a) => !a.webhookUrl);
        const result = await automationService_1.automationService.executeByAgentId(agentWithoutWebhook.id, {
            input: { prueba: true }
        });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.mode).toBe('mock');
            expect(result.data.status).toBe('completed');
        }
    });
});

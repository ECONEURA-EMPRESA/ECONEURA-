import { automationService } from '../../src/automation/automationService';
import { automationAgents } from '../../src/automation/automationAgentsRegistry';

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
    const agentWithoutWebhook = automationAgents.find((a) => !a.webhookUrl)!;
    const result = await automationService.executeByAgentId(agentWithoutWebhook.id, {
      input: { prueba: true }
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.mode).toBe('mock');
      expect(result.data.status).toBe('completed');
    }
  });
});


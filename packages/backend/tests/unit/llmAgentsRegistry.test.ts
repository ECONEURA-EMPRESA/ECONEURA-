import { getLLMAgent, llmAgents } from '../../src/llm/llmAgentsRegistry';

describe('llmAgentsRegistry', () => {
  it('debe devolver un agente válido por id', () => {
    expect(llmAgents.length).toBeGreaterThan(0);
    const anyAgent = llmAgents[0]!;
    const result = getLLMAgent(anyAgent.id);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.id).toBe(anyAgent.id);
    }
  });

  it('debe devolver error si el agente no existe', () => {
    const result = getLLMAgent('agente-inexistente');

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(typeof result.error).toBe('string');
    }
  });
});



import { openAIAdapter } from '../../src/infra/llm/OpenAIAdapter';
import { getValidatedEnv } from '../../src/config/env';

jest.mock('../../src/config/env', () => ({
  getValidatedEnv: jest.fn()
}));

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: 'respuesta openai mock' } }]
        })
      }
    }
  }));
});

describe('OpenAIAdapter', () => {
  it('debe lanzar error si OPENAI_API_KEY no está configurada', async () => {
    (getValidatedEnv as jest.Mock).mockReturnValue({});

    await expect(
      openAIAdapter.generate({
        model: 'gpt-4.1',
        systemPrompt: 'test',
        userInput: 'hola',
        temperature: 0.5,
        maxTokens: 100
      })
    ).rejects.toThrow('OPENAI_API_KEY no configurada');
  });

  it('debe devolver resultado correcto cuando OpenAI responde', async () => {
    (getValidatedEnv as jest.Mock).mockReturnValue({
      OPENAI_API_KEY: 'test-key'
    });

    const result = await openAIAdapter.generate({
      model: 'gpt-4.1',
      systemPrompt: 'test',
      userInput: 'hola',
      temperature: 0.5,
      maxTokens: 100
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.outputText).toBe('respuesta openai mock');
    }
  });
});



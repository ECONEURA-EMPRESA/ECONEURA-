"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const OpenAIAdapter_1 = require("../../src/infra/llm/OpenAIAdapter");
const env_1 = require("../../src/config/env");
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
        env_1.getValidatedEnv.mockReturnValue({});
        await expect(OpenAIAdapter_1.openAIAdapter.generate({
            model: 'gpt-4.1',
            systemPrompt: 'test',
            userInput: 'hola',
            temperature: 0.5,
            maxTokens: 100
        })).rejects.toThrow('OPENAI_API_KEY no configurada');
    });
    it('debe devolver resultado correcto cuando OpenAI responde', async () => {
        env_1.getValidatedEnv.mockReturnValue({
            OPENAI_API_KEY: 'test-key'
        });
        const result = await OpenAIAdapter_1.openAIAdapter.generate({
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

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const invokeLLMAgent_1 = require("../../src/llm/invokeLLMAgent");
class LLMClientMockOk {
    async generate() {
        return {
            success: true,
            data: {
                agentId: 'neura-ceo',
                outputText: 'respuesta mock',
                raw: null
            }
        };
    }
}
class LLMClientMockError {
    async generate() {
        return {
            success: false,
            error: new Error('Fallo en LLM')
        };
    }
}
describe('invokeLLMAgent', () => {
    it('debe devolver generación correcta cuando el cliente LLM responde ok', async () => {
        const result = await (0, invokeLLMAgent_1.invokeLLMAgent)({
            agentId: 'neura-ceo',
            userInput: 'hola',
            correlationId: 'test-correlation'
        }, { llmClient: new LLMClientMockOk() });
        expect(result.success).toBe(true);
        if (result.success) {
            expect(result.data.outputText).toBe('respuesta mock');
        }
    });
    it('debe devolver error cuando el cliente LLM falla', async () => {
        const result = await (0, invokeLLMAgent_1.invokeLLMAgent)({
            agentId: 'neura-ceo',
            userInput: 'hola',
            correlationId: 'test-correlation',
            conversationHistory: [{ role: 'user', content: 'bypass cache' }]
        }, { llmClient: new LLMClientMockError() });
        expect(result.success).toBe(false);
        if (!result.success) {
            expect(result.error).toBeInstanceOf(Error);
        }
    });
});

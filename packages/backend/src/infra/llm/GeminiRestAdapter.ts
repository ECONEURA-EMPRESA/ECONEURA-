/**
 * ECONEURA - Gemini REST Adapter
 * Adaptador para Google Gemini 3 API (REST directo sin SDK)
 */
import { type LLMClient, type GenerationResult } from '../../llm/invokeLLMAgent';
import { ok, err, type Result } from '../../shared/Result';
import { logger } from '../../shared/logger';

interface GeminiPart {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
    functionCall?: {
        name: string;
        args: Record<string, unknown>;
    };
}

interface GeminiContent {
    role: 'user' | 'model';
    parts: GeminiPart[];
}

interface GeminiSystemInstruction {
    parts: { text: string }[];
}

interface GeminiResponse {
    candidates?: Array<{
        content: {
            parts: Array<{ text?: string; functionCall?: { name: string; args: Record<string, unknown> } }>;
            role: string;
        };
        finishReason?: string;
    }>;
    error?: {
        code: number;
        message: string;
        status: string;
    };
}

// Interfaces para Function Calling
interface GeminiFunctionDeclaration {
    name: string;
    description: string;
    parameters?: {
        type: string;
        properties: Record<string, unknown>;
        required?: string[];
    };
}

interface GeminiTool {
    functionDeclarations: GeminiFunctionDeclaration[];
}

interface GeminiRequest {
    contents: GeminiContent[];
    tools?: GeminiTool[];
    systemInstruction?: GeminiSystemInstruction;
    generationConfig?: {
        temperature?: number;
        maxOutputTokens?: number;
        topP?: number;
        topK?: number;
    };
    safetySettings?: Array<{
        category: string;
        threshold: string;
    }>;
}

export class GeminiRestAdapter implements LLMClient {
    private apiKey: string | null = null;
    private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

    private ensureApiKey(): string {
        if (this.apiKey) return this.apiKey;

        // Intentar leer de process.env directamente si getValidatedEnv falla o no tiene la key
        const key = process.env['GEMINI_API_KEY'] || process.env['GOOGLE_API_KEY'];
        if (!key) {
            throw new Error('GEMINI_API_KEY no configurada en variables de entorno');
        }
        this.apiKey = key;
        return this.apiKey;
    }

    async generate(params: {
        model: string;
        systemPrompt: string;
        userInput: string;
        temperature: number;
        maxTokens: number;
        correlationId?: string;
        image?: string;
        file?: string;
        conversationHistory?: Array<{ role: string; content: string }>;
        tools?: Array<{ functionDeclarations: Array<{ name: string; description: string; parameters?: Record<string, unknown> }> }>;
    }): Promise<Result<GenerationResult, Error>> {
        try {
            const apiKey = this.ensureApiKey();
            const modelName = params.model || 'gemini-2.0-flash';
            const endpoint = `${this.baseUrl}/${modelName}:generateContent?key=${apiKey}`;

            // 1. Construir historial
            const contents: GeminiContent[] = [];
            if (params.conversationHistory && params.conversationHistory.length > 0) {
                params.conversationHistory.forEach(msg => {
                    const role = msg.role === 'user' ? 'user' : 'model';
                    if (msg.role !== 'system') {
                        contents.push({ role, parts: [{ text: msg.content }] });
                    }
                });
            }

            // 2. Construir mensaje actual
            const currentParts: GeminiPart[] = [];
            if (params.userInput) currentParts.push({ text: params.userInput });
            if (params.image) currentParts.push({ inlineData: { mimeType: 'image/jpeg', data: params.image } });
            if (params.file) currentParts.push({ inlineData: { mimeType: 'application/pdf', data: params.file } });

            contents.push({ role: 'user', parts: currentParts });

            // 3. Construir Tools (Function Calling)
            let geminiTools: GeminiTool[] | undefined;
            if (params.tools && params.tools.length > 0) {
                geminiTools = params.tools.map(t => ({
                    functionDeclarations: t.functionDeclarations.map(f => ({
                        name: f.name,
                        description: f.description,
                        parameters: f.parameters ? {
                            type: 'OBJECT',
                            properties: f.parameters,
                            required: Object.keys(f.parameters) // Asumimos todos requeridos por simplicidad o ajustar según schema
                        } : undefined
                    }))
                }));
            }

            // 4. Construir Request
            const requestBody: GeminiRequest = {
                contents,
                tools: geminiTools,
                systemInstruction: { parts: [{ text: params.systemPrompt }] },
                generationConfig: {
                    temperature: params.temperature || 0.7,
                    maxOutputTokens: params.maxTokens || 2048,
                    topP: 0.95,
                    topK: 40
                },
                safetySettings: [
                    { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                    { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                ]
            };

            // 5. Llamada REST con Retry (Mejora 4)
            let response: Response | null = null;
            let attempts = 0;
            while (attempts < 3) {
                try {
                    response = await fetch(endpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });
                    if (response.ok || response.status === 400) break; // 400 no se reintenta
                } catch (e) {
                    logger.warn(`[GeminiRestAdapter] Intento ${attempts + 1} fallido`, { error: String(e) });
                }
                attempts++;
                if (attempts < 3) await new Promise(r => setTimeout(r, 1000 * attempts));
            }

            if (!response || !response.ok) {
                const errorText = response ? await response.text() : 'Network Error';
                return err(new Error(`Gemini API Error: ${response?.status} - ${errorText}`));
            }

            const data = await response.json() as GeminiResponse;

            // 6. Procesar respuesta
            if (data.candidates && data.candidates.length > 0) {
                const candidate = data.candidates[0];
                if (!candidate) {
                    return err(new Error('Gemini devolvió un candidato vacío'));
                }
                let outputText = '';
                const functionCalls: Array<{ name: string; args: Record<string, unknown> }> = [];

                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.text) {
                            outputText += part.text;
                        }
                        if (part.functionCall) {
                            functionCalls.push({ name: part.functionCall.name, args: part.functionCall.args });
                        }
                    }
                }

                return ok({
                    agentId: '',
                    outputText,
                    functionCalls: functionCalls.length > 0 ? functionCalls : undefined,
                    raw: data
                });
            } else {
                return err(new Error('Gemini no devolvió candidatos válidos'));
            }

        } catch (e: unknown) {
            const error = e instanceof Error ? e : new Error(String(e));
            logger.error('[GeminiRestAdapter] Excepción', { error: error.message });
            return err(error);
        }
    }
}

// Singleton lazy
let _geminiAdapter: GeminiRestAdapter | null = null;

export function getGeminiAdapter(): GeminiRestAdapter {
    if (!_geminiAdapter) {
        _geminiAdapter = new GeminiRestAdapter();
    }
    return _geminiAdapter;
}

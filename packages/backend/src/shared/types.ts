export type NeuraId = string;
export type NeuraDepartment = string;

export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    fieldErrors?: Record<string, string[]>;
}

export type LLMProvider = 'google' | 'gemini' | 'openai' | 'anthropic' | 'mistral' | 'other' | 'custom';

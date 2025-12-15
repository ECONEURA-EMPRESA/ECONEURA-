/**
 * Tipos compartidos de ECONEURA
 */

export type Agent = {
  id: string;
  title: string;
  desc: string;
  pills?: string[];
};

export interface Department {
  id: string;
  name: string;
  chips: string[];
  neura: {
    title: string;
    model: string;
    desc: string;
    tags: string[];
    value: {
      timeSavedHoursMonth: number;
      tokensUsedMonth: number;
      costMonth: number;
      problem: string;
      solution: string;
    };
  };
  agents: Agent[];
}

export type NeuraActivity = {
  id: string;
  ts: string;
  agentId: string;
  deptId: string;
  status: 'OK' | 'ERROR';
  message: string;
  executionId?: string;
};

export type ChatMessage = {
  id: string;
  text: string;
  role: 'user' | 'assistant';
  model?: string;
  tokens?: number;
  reasoning_tokens?: number;
  agentExecution?: {
    agentId: string;
    status: 'pending' | 'running' | 'success' | 'error';
    message?: string;
  };
};

export type Language = 'es' | 'en' | 'fr';

// Re-export agent types
export * from './agent';

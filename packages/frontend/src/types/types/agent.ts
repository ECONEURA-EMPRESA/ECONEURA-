/**
 * Tipos para el sistema de ejecución de agentes automatizados
 */

export interface Agent {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
  triggers: string[]; // Palabras clave que activan el agente
  executionType: 'make' | 'n8n' | 'zapier' | 'custom';
  webhookUrl?: string;
  status: 'active' | 'inactive';
  icon?: string;
  category: string;
}

export interface AgentExecutionRequest {
  chatContext: string;
  userIntent: string;
  suggestedAgents: string[];
  reasoning: string;
  confidence: number; // 0-1
}

export interface AgentExecution {
  id: string;
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime: string;
  endTime?: string;
  result?: any;
  error?: string;
  reasoning: string;
}

export interface ExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  executionTime: number;
  agentId: string;
}

export interface AgentExecutionContext {
  userId: string;
  chatId: string;
  messages: ChatMessage[];
  userIntent: string;
  suggestedActions: string[];
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: number;
}

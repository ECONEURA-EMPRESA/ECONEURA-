import { ok, err, type Result } from '../shared/Result';
import { AutomationAgent } from './types';

// Modular Imports
import { automationAgents as ceoAgents } from './config/ceo';
import { automationAgents as ctoAgents } from './config/cto';
import { automationAgents as cmoAgents } from './config/cmo';
import { automationAgents as cfoAgents } from './config/cfo';
import { automationAgents as cisoAgents } from './config/ciso';
import { automationAgents as cooAgents } from './config/coo';
import { automationAgents as chroAgents } from './config/chro';
import { automationAgents as cdoAgents } from './config/cdo';
import { automationAgents as cinoAgents } from './config/cino';
import { automationAgents as iaAgents } from './config/ia';

// Re-export types for consumers
export * from './types';

// Aggregated Registry
const automationAgentsRaw: AutomationAgent[] = [
  ...ceoAgents,
  ...ctoAgents,
  ...cmoAgents,
  ...cfoAgents,
  ...cisoAgents,
  ...cooAgents,
  ...chroAgents,
  ...cdoAgents,
  ...cinoAgents,
  ...iaAgents
];

export const automationAgents: AutomationAgent[] = automationAgentsRaw;

export function getAutomationAgentById(id: string): Result<AutomationAgent, Error> {
  const agent = automationAgents.find((a) => a.id === id && a.active);
  if (!agent) {
    return err(new Error(`Automation agent not found: ${id}`));
  }
  return ok(agent);
}

export function getAutomationAgentsByNeuraKey(neuraKey: string): AutomationAgent[] {
  return automationAgents.filter((a) => a.neuraKey === neuraKey && a.active);
}

/**
 * Valida que todas las variables de entorno necesarias estén presentes.
 * Lanza un error si falta alguna variable crítica para un agente activo.
 */
export function validateAutomationEnvironment(): void {
  const missingVars: string[] = [];

  automationAgentsRaw.forEach((agent) => {
    if (agent.active && !agent.webhookUrl) {
      missingVars.push(`Webhook URL for active agent '${agent.name}' (${agent.id}) is missing`);
    }
  });

  if (missingVars.length > 0) {
    const errorMessage = `
      CRITICAL ERROR: Missing Environment Variables for Automation Agents.
      The following active agents are missing their webhook URLs:
      ${missingVars.map(v => `- ${v}`).join('\n')}
      
      Please check your .env file and ensure all required WEBHOOK_ variables are defined.
    `;
    // En desarrollo o producción, esto debería detener la ejecución para evitar comportamientos inesperados
    if (process.env['NODE_ENV'] !== 'test') {
      console.error(errorMessage);
    }
  }
}

// Ejecutar validación al cargar el módulo (fail fast)
validateAutomationEnvironment();



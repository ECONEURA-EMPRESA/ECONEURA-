import { ok, err, type Result } from '../../../shared/Result';
import type { AutomationAgent } from '../../domain/entities/AutomationAgent';

// Modular Imports (Referencing Config - We might need to move config too or alias it)
import { automationAgents as ceoAgents } from '../../config/ceo';
import { automationAgents as ctoAgents } from '../../config/cto';
import { automationAgents as cmoAgents } from '../../config/cmo';
import { automationAgents as cfoAgents } from '../../config/cfo';
import { automationAgents as cisoAgents } from '../../config/ciso';
import { automationAgents as cooAgents } from '../../config/coo';
import { automationAgents as chroAgents } from '../../config/chro';
import { automationAgents as cdoAgents } from '../../config/cdo';
import { automationAgents as cinoAgents } from '../../config/cino';
import { automationAgents as iaAgents } from '../../config/ia';

// Adapting raw config to Domain Entity if needed (currently they match closely)
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
] as unknown as AutomationAgent[]; // Cast temporal mientras alineamos tipos

export const automationAgents: AutomationAgent[] = automationAgentsRaw;

export class InMemoryAgentRepository {
    findById(id: string): Result<AutomationAgent, Error> {
        const agent = automationAgents.find((a) => a.id === id && a.active);
        if (!agent) {
            return err(new Error(`Automation agent not found: ${id}`));
        }
        return ok(agent);
    }

    findByNeuraKey(neuraKey: string): AutomationAgent[] {
        return automationAgents.filter((a) => a.neuraKey === neuraKey && a.active);
    }

    findAll(): AutomationAgent[] {
        return automationAgents;
    }
}

export const agentRepository = new InMemoryAgentRepository();

/**
 * Valida variables de entorno al cargar
 */
export function validateAutomationEnvironment(): void {
    const missingVars: string[] = [];
    automationAgentsRaw.forEach((agent) => {
        if (agent.active && !agent.webhookUrl && agent.provider !== 'custom') {
            // Logic for validation
            if (!agent.webhookUrl) missingVars.push(`Webhook URL for ${agent.name}`);
        }
    });

    if (missingVars.length > 0 && process.env.NODE_ENV !== 'test') {
        console.error('CRITICAL: Missing webhooks', missingVars);
    }
}

validateAutomationEnvironment();

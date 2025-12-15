// Detector de agentes (versión simplificada)
export interface AgentIntent {
}

export function getAgentInfo(agentId: string): { name: string; icon: string } | null {
  return {
    name: agentId,
    icon: '🤖'
  };
}

export function generateConfirmationMessage(agentId: string): string {
  return `Ejecutar agente ${agentId}?`;
}

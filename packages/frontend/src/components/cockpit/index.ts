/**
 * Cockpit Components - Barrel Export
 * Exporta todos los componentes del Cockpit desde un solo lugar
 */

// Componentes principales
export { AgentCard } from './AgentCard';
export type { Agent, AgentCardProps } from './AgentCard';

export { NewAgentCard } from './NewAgentCard';
export type { NewAgentCardProps } from './NewAgentCard';

export { FooterComponent } from './FooterComponent';

export { OrgChart } from './OrgChart';

// Re-export para compatibilidad
export { AgentCard as default } from './AgentCard';

import { ok, err, type Result } from '../shared/Result';
import type { NeuraId, NeuraDepartment } from '../shared/types';

export interface NeuraDefinition {
  id: NeuraId;
  department: NeuraDepartment;
  displayName: string;
  description: string;
  llmAgentId: string;
}

export const neuraCatalog: NeuraDefinition[] = [
  {
    id: 'neura-ceo',
    department: 'Direccion',
    displayName: 'NEURA CEO',
    description: 'Neura central de dirección general y visión estratégica.',
    llmAgentId: 'neura-ceo'
  },
  {
    id: 'neura-cto',
    department: 'Tecnologia',
    displayName: 'NEURA CTO',
    description: 'Neura para decisiones tecnológicas y arquitectura 2025.',
    llmAgentId: 'neura-cto'
  },
  {
    id: 'neura-cfo',
    department: 'Finanzas',
    displayName: 'NEURA CFO',
    description: 'Neura de finanzas, control y previsiones.',
    llmAgentId: 'neura-cfo'
  },
  {
    id: 'neura-cmo',
    department: 'Marketing',
    displayName: 'NEURA CMO',
    description: 'Neura de marketing, growth y marca.',
    llmAgentId: 'neura-cmo'
  },
  {
    id: 'neura-ventas',
    department: 'Ventas',
    displayName: 'NEURA Ventas',
    description: 'Neura enfocada en procesos comerciales y cierre.',
    llmAgentId: 'neura-ventas'
  },
  {
    id: 'neura-atencion-cliente',
    department: 'AtencionCliente',
    displayName: 'NEURA Atención Cliente',
    description: 'Neura para soporte y éxito de cliente.',
    llmAgentId: 'neura-atencion-cliente'
  },
  {
    id: 'neura-rrhh',
    department: 'RRHH',
    displayName: 'NEURA RRHH',
    description: 'Neura de personas, talento y cultura.',
    llmAgentId: 'neura-rrhh'
  },
  {
    id: 'neura-operaciones',
    department: 'Operaciones',
    displayName: 'NEURA Operaciones',
    description: 'Neura de procesos, SLAs y eficiencia operativa.',
    llmAgentId: 'neura-operaciones'
  },
  {
    id: 'neura-legal',
    department: 'Legal',
    displayName: 'NEURA Legal',
    description: 'Neura orientada a revisión de riesgos y cumplimiento.',
    llmAgentId: 'neura-legal'
  },
  {
    id: 'neura-datos',
    department: 'Datos',
    displayName: 'NEURA Datos',
    description: 'Neura para análisis de datos, KPIs y reporting.',
    llmAgentId: 'neura-datos'
  },
  {
    id: 'neura-innovacion',
    department: 'Innovacion',
    displayName: 'NEURA Innovación',
    description: 'Neura para nuevos modelos de negocio y productos.',
    llmAgentId: 'neura-innovacion'
  }
];

export function getNeuraById(id: NeuraId): Result<NeuraDefinition, Error> {
  const neura = neuraCatalog.find((n) => n.id === id);
  if (!neura) {
    return err(new Error(`Neura not found: ${id}`));
  }
  return ok(neura);
}



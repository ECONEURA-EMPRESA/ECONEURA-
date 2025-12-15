import { useMemo } from 'react';
import Fuse from 'fuse.js';
import { Agent } from '../types';

interface AgentWithDept extends Agent {
  deptId: string;
  deptName: string;
}

/**
 * Hook para búsqueda fuzzy de agentes
 * @param allAgents - Array de agentes con información de departamento
 * @param query - Término de búsqueda
 * @param currentDeptAgents - Agentes del departamento actual (para fallback)
 * @returns Agentes filtrados (fuzzy si hay query, todos si no)
 */
export function useFuzzySearch(
  allAgents: AgentWithDept[],
  query: string,
  currentDeptAgents: Agent[]
): Agent[] {
  const fuse = useMemo(() => new Fuse(allAgents, {
    keys: ['title', 'desc', 'deptName'],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true
  }), [allAgents]);

  return useMemo(() => {
    if (!query.trim()) return currentDeptAgents;
    
    const results = fuse.search(query);
    return results.map(r => r.item);
  }, [fuse, query, currentDeptAgents]);
}



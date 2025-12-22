
import React from 'react';
import { AgentCard, NewAgentCard } from './AgentCards';
import type { Agent, NeuraActivity } from '../types';

interface AgentGridProps {
    agents: Agent[];
    deptId: string;
    deptColor: string;
    busyId: string | null;
    lastByAgent: Record<string, NeuraActivity | undefined>;
    showAllUsage: boolean;
    onRunAgent: (agent: Agent) => void;
    onConfigureAgent: (agent: { id: string; title: string }) => void;
    onCreateAgent: (deptId: string) => void;
}

export function AgentGrid({
    agents,
    deptId,
    deptColor,
    busyId,
    lastByAgent,
    showAllUsage,
    onRunAgent,
    onConfigureAgent,
    onCreateAgent
}: AgentGridProps) {
    return (
        <div className="mt-6 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start justify-items-center">
            {agents.map((a: Agent) => (
                <AgentCard
                    key={a.id}
                    a={a}
                    deptColor={deptColor}
                    busy={busyId === a.id}
                    progress={lastByAgent[a.id]?.status === 'OK' ? 100 : (lastByAgent[a.id]?.status === 'ERROR' ? 0 : 11)}
                    showUsage={showAllUsage}
                    onRun={() => onRunAgent(a)}
                    onConfigure={() => onConfigureAgent({ id: a.id, title: a.title })}
                />
            ))}
            <NewAgentCard deptId={deptId} deptColor={deptColor} onCreate={onCreateAgent} />
        </div>
    );
}

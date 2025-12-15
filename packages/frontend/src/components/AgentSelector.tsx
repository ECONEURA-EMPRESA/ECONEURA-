import type { Agent } from '../EconeuraCockpit'

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgent: Agent | null
  onSelectAgent: (agent: Agent) => void
}

export default function AgentSelector({ agents, selectedAgent, onSelectAgent }: AgentSelectorProps) {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 sticky top-24">
      <h2 className="text-lg font-bold text-white mb-4 flex items-center">
        <span className="mr-2">🤖</span>
        Agentes Disponibles
      </h2>

      <div className="space-y-2">
        {agents.map((agent) => (
          <button
            key={agent.id}
            onClick={() => onSelectAgent(agent)}
            className={`w-full text-left p-3 rounded-lg transition-all ${
              selectedAgent?.id === agent.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <div className="font-semibold text-sm">{agent.title}</div>
            <div className="text-xs opacity-75 mt-1 line-clamp-2">
              {agent.desc}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-6 p-3 bg-gray-900/50 rounded-lg text-xs text-gray-400">
        <div className="font-semibold mb-1">💡 Tip</div>
        <div>
          Cada agente tiene capacidades especializadas. Selecciona el más adecuado para tu consulta.
        </div>
      </div>
    </div>
  )
}

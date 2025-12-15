import React from 'react';
import { MessageCircle, Play, Activity } from 'lucide-react';

interface Agent {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  lastRun?: string;
}

interface EconeuraMainContentProps {
  activeDept: {
    id: string;
    name: string;
    neura: {
      title: string;
      subtitle: string;
      tags: string[];
    };
    agents: Agent[];
  };
  onOpenChat: () => void;
  onExecuteAgent: (agentId: string) => void;
}

export function EconeuraMainContent({
  activeDept,
  onOpenChat,
  onExecuteAgent
}: EconeuraMainContentProps) {
  return (
    <main className="flex-1 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header del departamento */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {activeDept.neura.title}
          </h1>
          <p className="text-slate-600 dark:text-gray-400 mb-4">
            {activeDept.neura.subtitle}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-6">
            {activeDept.neura.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-gray-300 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Acciones principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Chat NEURA */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200/40 dark:border-gray-700/40 shadow-sm hover:shadow-md transition-all duration-300">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <MessageCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Chat NEURA
              </h3>
            </div>
            <p className="text-slate-600 dark:text-gray-400 mb-4">
              Conversa directamente con {activeDept.neura.title} para análisis, estrategias y decisiones ejecutivas.
            </p>
            <button
              onClick={onOpenChat}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              Abrir Chat Premium
            </button>
          </div>

          {/* Estado del sistema */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-slate-200/40 dark:border-gray-700/40 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <Activity className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                Estado del Sistema
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-gray-400">AI Gateway</span>
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-gray-400">Agentes Activos</span>
                <span className="text-slate-900 dark:text-white font-medium">
                  {activeDept.agents.filter(a => a.status === 'active').length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de agentes */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200/40 dark:border-gray-700/40 shadow-sm">
          <div className="p-6 border-b border-slate-200/40 dark:border-gray-700/40">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Agentes Disponibles
            </h3>
            <p className="text-slate-600 dark:text-gray-400 mt-1">
              {activeDept.agents.length} agentes especializados para {activeDept.name}
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeDept.agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-4 border border-slate-200/40 dark:border-gray-700/40 rounded-xl hover:bg-slate-50 dark:hover:bg-gray-700/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {agent.title}
                    </h4>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${agent.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : agent.status === 'error'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                    >
                      {agent.status}
                    </span>
                  </div>

                  <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">
                    {agent.description}
                  </p>

                  <div className="flex items-center justify-between">
                    {agent.lastRun && (
                      <span className="text-xs text-slate-500 dark:text-gray-500">
                        Última ejecución: {agent.lastRun}
                      </span>
                    )}

                    <button
                      onClick={() => onExecuteAgent(agent.id)}
                      className="flex items-center gap-2 px-3 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 rounded-lg hover:bg-slate-200 dark:hover:bg-gray-600 transition-all duration-200 text-sm"
                    >
                      <Play className="w-4 h-4" />
                      Ejecutar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

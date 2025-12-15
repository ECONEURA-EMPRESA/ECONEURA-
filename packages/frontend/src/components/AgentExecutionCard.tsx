/**
 * AgentExecutionCard - Tarjeta de ejecución de agentes
 * Componente funcional para mostrar estado de ejecución
 */
import { Play, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface AgentExecutionCardProps {
  agentId: string;
  agentName: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  result?: any;
  error?: string;
}

export function AgentExecutionCard({
  agentId,
  agentName,
  status,
  startTime,
  endTime,
  result,
  error
}: AgentExecutionCardProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-gray-400" />;
      case 'running': return <Play className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed': return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'pending': return 'bg-gray-100 border-gray-300 text-gray-700';
      case 'running': return 'bg-blue-50 border-blue-300 text-blue-700';
      case 'completed': return 'bg-green-50 border-green-300 text-green-700';
      case 'failed': return 'bg-red-50 border-red-300 text-red-700';
    }
  };

  const duration = startTime && endTime 
    ? Math.round((new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000)
    : null;

  return (
    <div className={`p-4 border-2 rounded-lg ${getStatusColor()} transition-all duration-300`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <h4 className="font-semibold">{agentName}</h4>
            <p className="text-xs opacity-75">{agentId}</p>
          </div>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-medium uppercase">
          {status}
        </span>
      </div>

      {startTime && (
        <div className="text-xs opacity-75 mb-2">
          Inicio: {new Date(startTime).toLocaleString('es-ES')}
        </div>
      )}

      {duration && (
        <div className="text-xs opacity-75 mb-2">
          Duración: {duration}s
        </div>
      )}

      {result && status === 'completed' && (
        <div className="mt-2 p-2 bg-white/50 rounded text-xs">
          <strong>Resultado:</strong>
          <pre className="mt-1 whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}

      {error && status === 'failed' && (
        <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { TrendingUp, Clock, Zap, Activity } from 'lucide-react';

interface AnalyticsData {
  totalExecutions: number;
  avgDuration: number;
  tokensUsed: number;
  activeUsers: number;
}

interface AnalyticsProps {
  darkMode?: boolean;
}

export function Analytics({ darkMode = false }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsData>({
    totalExecutions: 0,
    avgDuration: 0,
    tokensUsed: 0,
    activeUsers: 0
  });

  useEffect(() => {
    // Simular carga de analytics (en producción vendría de API)
    const mockData: AnalyticsData = {
      totalExecutions: 1247,
      avgDuration: 2.3,
      tokensUsed: 45678,
      activeUsers: 23
    };

    setTimeout(() => setData(mockData), 500);
  }, []);

  const metrics = [
    {
      icon: Activity,
      label: 'Ejecuciones',
      value: data.totalExecutions.toLocaleString(),
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      icon: Clock,
      label: 'Tiempo Promedio',
      value: `${data.avgDuration}s`,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      icon: Zap,
      label: 'Tokens',
      value: data.tokensUsed.toLocaleString(),
      color: 'text-amber-600',
      bgColor: 'bg-amber-50'
    },
    {
      icon: TrendingUp,
      label: 'Usuarios Activos',
      value: data.activeUsers.toString(),
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl ${
      darkMode ? 'bg-slate-800/50' : 'bg-white/50'
    } backdrop-blur-sm border ${
      darkMode ? 'border-slate-700' : 'border-slate-200'
    }`}>
      {metrics.map((metric, idx) => {
        const Icon = metric.icon;
        return (
          <div
            key={idx}
            className={`flex flex-col gap-2 p-4 rounded-lg ${
              darkMode ? 'bg-slate-700/50' : metric.bgColor
            } transition-all hover:scale-105`}
          >
            <div className="flex items-center gap-2">
              <Icon className={`w-5 h-5 ${metric.color}`} />
              <span className={`text-xs font-medium ${
                darkMode ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {metric.label}
              </span>
            </div>
            <div className={`text-2xl font-bold ${
              darkMode ? 'text-slate-100' : 'text-slate-900'
            }`}>
              {metric.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}


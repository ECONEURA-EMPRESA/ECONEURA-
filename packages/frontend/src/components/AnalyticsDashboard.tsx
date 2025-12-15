import { useState, useEffect, useRef } from 'react';
import { BarChart3, TrendingUp, Users, MessageSquare, Clock, Zap } from 'lucide-react';

interface AnalyticsData {
  userMetrics: {
    totalUsers: number;
    activeUsers: number;
    newUsers: number;
    userGrowth: number;
  };
  chatMetrics: {
    totalChats: number;
    totalMessages: number;
    avgMessagesPerChat: number;
    avgResponseTime: number;
    satisfactionScore: number;
  };
  neuraMetrics: {
    [neuraId: string]: {
      name: string;
      department: string;
      totalInteractions: number;
      avgResponseTime: number;
      satisfactionScore: number;
      usagePercentage: number;
    };
  };
  performanceMetrics: {
    avgPageLoadTime: number;
    apiResponseTime: number;
    errorRate: number;
    uptime: number;
  };
  trends: {
    dailyActiveUsers: Array<{ date: string; count: number }>;
    messageVolume: Array<{ date: string; count: number }>;
    neuraUsage: Array<{ neuraId: string; usage: number }>;
  };
}

interface AnalyticsService {
  getAnalytics: () => Promise<AnalyticsData>;
  trackEvent: (event: string, data?: any) => void;
  trackPageView: (page: string) => void;
  trackUserAction: (action: string, neuraId?: number) => void;
}

class LocalAnalyticsService implements AnalyticsService {
  private events: Array<{ event: string; data: any; timestamp: Date }> = [];
  private pageViews: Array<{ page: string; timestamp: Date }> = [];
  private userActions: Array<{ action: string; neuraId?: number; timestamp: Date }> = [];

  async getAnalytics(): Promise<AnalyticsData> {
    // Simular datos de analytics
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    return {
      userMetrics: {
        totalUsers: 1247,
        activeUsers: 892,
        newUsers: 156,
        userGrowth: 14.3
      },
      chatMetrics: {
        totalChats: 3456,
        totalMessages: 12847,
        avgMessagesPerChat: 3.7,
        avgResponseTime: 1.2,
        satisfactionScore: 4.6
      },
      neuraMetrics: {
        '0': { name: 'CEO', department: 'Dirección General', totalInteractions: 1245, avgResponseTime: 1.1, satisfactionScore: 4.8, usagePercentage: 18.2 },
        '1': { name: 'IA', department: 'Inteligencia Artificial', totalInteractions: 2156, avgResponseTime: 0.8, satisfactionScore: 4.7, usagePercentage: 31.5 },
        '2': { name: 'CSO', department: 'Supply Chain', totalInteractions: 987, avgResponseTime: 1.5, satisfactionScore: 4.4, usagePercentage: 14.4 },
        '3': { name: 'CTO', department: 'Tecnología', totalInteractions: 1789, avgResponseTime: 1.0, satisfactionScore: 4.6, usagePercentage: 26.1 },
        '4': { name: 'CISO', department: 'Seguridad', totalInteractions: 654, avgResponseTime: 1.3, satisfactionScore: 4.5, usagePercentage: 9.5 },
        '5': { name: 'COO', department: 'Operaciones', totalInteractions: 1123, avgResponseTime: 1.4, satisfactionScore: 4.3, usagePercentage: 16.4 },
        '6': { name: 'CHRO', department: 'Recursos Humanos', totalInteractions: 789, avgResponseTime: 1.6, satisfactionScore: 4.2, usagePercentage: 11.5 },
        '7': { name: 'CMO', department: 'Marketing', totalInteractions: 1456, avgResponseTime: 1.2, satisfactionScore: 4.7, usagePercentage: 21.3 },
        '8': { name: 'CFO', department: 'Finanzas', totalInteractions: 1345, avgResponseTime: 1.1, satisfactionScore: 4.8, usagePercentage: 19.6 },
        '9': { name: 'CDO', department: 'Datos', totalInteractions: 923, avgResponseTime: 0.9, satisfactionScore: 4.6, usagePercentage: 13.5 }
      },
      performanceMetrics: {
        avgPageLoadTime: 1.8,
        apiResponseTime: 0.6,
        errorRate: 0.2,
        uptime: 99.8
      },
      trends: {
        dailyActiveUsers: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 200) + 600
        })),
        messageVolume: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          count: Math.floor(Math.random() * 500) + 200
        })),
        neuraUsage: Object.entries({
          '0': 18.2, '1': 31.5, '2': 14.4, '3': 26.1, '4': 9.5,
          '5': 16.4, '6': 11.5, '7': 21.3, '8': 19.6, '9': 13.5
        }).map(([neuraId, usage]) => ({ neuraId, usage }))
      }
    };
  }

  trackEvent(event: string, data?: any): void {
    this.events.push({ event, data, timestamp: new Date() });
  }

  trackPageView(page: string): void {
    this.pageViews.push({ page, timestamp: new Date() });
  }

  trackUserAction(action: string, neuraId?: number): void {
    this.userActions.push({ action, neuraId, timestamp: new Date() });
  }
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const serviceRef = useRef<AnalyticsService>(new LocalAnalyticsService());

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setIsLoading(true);
      const data = await serviceRef.current.getAnalytics();
      setAnalytics(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const trackEvent = (event: string, data?: any) => {
    serviceRef.current.trackEvent(event, data);
  };

  const trackPageView = (page: string) => {
    serviceRef.current.trackPageView(page);
  };

  const trackUserAction = (action: string, neuraId?: number) => {
    serviceRef.current.trackUserAction(action, neuraId);
  };

  return {
    analytics,
    isLoading,
    error,
    loadAnalytics,
    trackEvent,
    trackPageView,
    trackUserAction
  };
}

// Componente de dashboard de analytics
export function AnalyticsDashboard() {
  const { analytics, isLoading, error, loadAnalytics } = useAnalytics();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <BarChart3 className="w-8 h-8 animate-spin mx-auto mb-2 text-blue-500" />
          <p>Cargando analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        <p>Error cargando analytics: {error}</p>
        <button
          onClick={loadAnalytics}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Usuarios Activos"
          value={analytics.userMetrics.activeUsers}
          change={analytics.userMetrics.userGrowth}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Total Chats"
          value={analytics.chatMetrics.totalChats}
          change={12.5}
          icon={MessageSquare}
          color="green"
        />
        <MetricCard
          title="Tiempo Respuesta"
          value={`${analytics.chatMetrics.avgResponseTime}s`}
          change={-8.2}
          icon={Clock}
          color="orange"
        />
        <MetricCard
          title="Satisfacción"
          value={analytics.chatMetrics.satisfactionScore}
          change={2.1}
          icon={TrendingUp}
          color="purple"
        />
      </div>

      {/* Métricas de NEURAs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Uso por NEURA</h3>
        <div className="space-y-3">
          {Object.entries(analytics.neuraMetrics).map(([neuraId, metrics]) => (
            <div key={neuraId} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  {metrics.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{metrics.name}</p>
                  <p className="text-sm text-gray-500">{metrics.department}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm font-medium">{metrics.totalInteractions} interacciones</p>
                  <p className="text-xs text-gray-500">{metrics.avgResponseTime}s promedio</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{metrics.usagePercentage}%</p>
                  <p className="text-xs text-gray-500">⭐ {metrics.satisfactionScore}</p>
                </div>
                <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${metrics.usagePercentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Métricas de rendimiento */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Rendimiento del Sistema</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Tiempo de carga promedio</span>
              <span className="font-medium">{analytics.performanceMetrics.avgPageLoadTime}s</span>
            </div>
            <div className="flex justify-between">
              <span>Tiempo de respuesta API</span>
              <span className="font-medium">{analytics.performanceMetrics.apiResponseTime}s</span>
            </div>
            <div className="flex justify-between">
              <span>Tasa de error</span>
              <span className="font-medium text-red-500">{analytics.performanceMetrics.errorRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Uptime</span>
              <span className="font-medium text-green-500">{analytics.performanceMetrics.uptime}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Tendencias</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Usuarios activos (30 días)</span>
              <span className="font-medium text-green-500">+{analytics.userMetrics.userGrowth}%</span>
            </div>
            <div className="flex justify-between">
              <span>Volumen de mensajes</span>
              <span className="font-medium">{analytics.chatMetrics.totalMessages}</span>
            </div>
            <div className="flex justify-between">
              <span>Promedio mensajes/chat</span>
              <span className="font-medium">{analytics.chatMetrics.avgMessagesPerChat}</span>
            </div>
            <div className="flex justify-between">
              <span>NEURA más usado</span>
              <span className="font-medium">IA (31.5%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  color 
}: {
  title: string;
  value: string | number;
  change: number;
  icon: any;
  color: string;
}) {
  const colorClasses = {
    blue: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20',
    green: 'text-green-500 bg-green-50 dark:bg-green-900/20',
    orange: 'text-orange-500 bg-orange-50 dark:bg-orange-900/20',
    purple: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20'
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      <div className="mt-2 flex items-center">
        <span className={`text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
        <span className="text-sm text-gray-500 ml-1">vs mes anterior</span>
      </div>
    </div>
  );
}

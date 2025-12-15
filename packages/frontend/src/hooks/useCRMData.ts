/**
 * Hook personalizado para obtener datos del CRM desde la API
 * Maneja estados de loading, error y datos con validación
 */

import { useState, useEffect, useCallback } from 'react';
// import { API_URL } from '../config/api';
import { toast } from 'sonner';
import { getApiUrl, createAuthHeaders } from '../utils/apiUrl';

export type Period = 'week' | 'month' | 'quarter' | 'year';

export interface CRMSalesMetrics {
  totalRevenue: number;
  revenueTarget: number;
  dealsInProgress: number;
  dealsWon: number;
  leadToMQL: number;
  mqlToSQL: number;
  avgConversionTime: number;
  conversionTimeTrend: 'up' | 'down';
}

export interface CRMPipelineStage {
  stage: string;
  amount: number;
  conversion: number;
  progress: number;
  color: string;
  value: number;
}

export interface CRMAgentImpact {
  agent: string;
  impact: string;
  status: string;
  icon?: string; // Opcional, puede ser string o componente
}

export interface CRMAlert {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  ts: string;
}

export interface CRMRevenueData {
  month: string;
  revenue: number;
  target: number;
}

interface UseCRMDataReturn {
  metrics: CRMSalesMetrics | null;
  pipeline: CRMPipelineStage[];
  agentImpact: CRMAgentImpact[];
  alerts: CRMAlert[];
  revenueData: CRMRevenueData[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  lastUpdate: Date | null;
}

/**
 * Valida y sanitiza los datos recibidos de la API
 */
function validateMetrics(data: unknown): CRMSalesMetrics | null {
  if (!data || typeof data !== 'object' || data === null) return null;

  // Type guard para verificar que es un objeto con propiedades
  const obj = data as Record<string, unknown>;

  return {
    totalRevenue: typeof obj.totalRevenue === 'number' ? obj.totalRevenue : 0,
    revenueTarget: typeof obj.revenueTarget === 'number' ? obj.revenueTarget : 0,
    dealsInProgress: typeof obj.dealsInProgress === 'number' ? obj.dealsInProgress : 0,
    dealsWon: typeof obj.dealsWon === 'number' ? obj.dealsWon : 0,
    leadToMQL: typeof obj.leadToMQL === 'number' ? Math.max(0, Math.min(1, obj.leadToMQL)) : 0,
    mqlToSQL: typeof obj.mqlToSQL === 'number' ? Math.max(0, Math.min(1, obj.mqlToSQL)) : 0,
    avgConversionTime: typeof obj.avgConversionTime === 'number' ? obj.avgConversionTime : 0,
    conversionTimeTrend: obj.conversionTimeTrend === 'down' ? 'down' : 'up'
  };
}

/**
 * Hook para obtener datos del CRM
 * @param period - Período de tiempo para los datos
 * @param department - Departamento (CMO/CSO)
 * @param enabled - Si está habilitado para hacer fetch
 */
export function useCRMData(
  period: Period = 'month',
  department: string = 'cmo',
  enabled: boolean = true
): UseCRMDataReturn {
  const [metrics, setMetrics] = useState<CRMSalesMetrics | null>(null);
  const [pipeline, setPipeline] = useState<CRMPipelineStage[]>([]);
  const [agentImpact, setAgentImpact] = useState<CRMAgentImpact[]>([]);
  const [alerts, setAlerts] = useState<CRMAlert[]>([]);
  const [revenueData, setRevenueData] = useState<CRMRevenueData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      // ✅ AUDITORÍA: Usar utilidad centralizada
      const apiUrl = getApiUrl();
      const headers = createAuthHeaders();

      // Validar que department sea 'cmo' o 'cso' (backend requiere estos valores exactos)
      const validDepartment = (department === 'cmo' || department === 'cso') ? department : 'cmo';

      // Validar que period sea válido (backend acepta: 'day', 'week', 'month', 'year', 'all')
      const validPeriod = (period === 'week' || period === 'month' || period === 'quarter' || period === 'year')
        ? (period === 'quarter' ? 'month' : period) // 'quarter' no existe en backend, usar 'month'
        : 'month';

      // Fetch sales metrics
      const metricsResponse = await fetch(
        `${apiUrl}/api/crm/sales-metrics?department=${validDepartment}&period=${validPeriod}`,
        { headers }
      );

      if (!metricsResponse.ok) {
        // Si es 400 o 404, usar datos mock (endpoint puede no estar implementado o tener problemas)
        if (metricsResponse.status === 400 || metricsResponse.status === 404) {
          // Log warning solo en desarrollo
          if (import.meta.env.DEV) {

            console.warn('[CRM] API no disponible o parámetros inválidos, usando datos mock');
          }
          setMetrics(null); // null activará datos mock en el componente
          setLastUpdate(new Date());
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${metricsResponse.status}: ${metricsResponse.statusText}`);
      }

      const metricsData = await metricsResponse.json();

      // Backend retorna: { success: true, data: { ... } }
      const actualData = metricsData?.success && metricsData?.data
        ? metricsData.data
        : metricsData;

      const validatedMetrics = validateMetrics(actualData);

      if (validatedMetrics) {
        setMetrics(validatedMetrics);
      } else {
        // Si no hay métricas válidas, dejar null para usar mock
        setMetrics(null);
      }

      // NOTA: Estos endpoints no existen aún en el backend
      // Se mantienen vacíos y se usan datos mock como fallback
      // ✅ AUDITORÍA: FUTURO - Implementar endpoints en backend cuando sea necesario:
      // - /api/crm/pipeline
      // - /api/crm/agents  
      // - /api/crm/alerts
      // - /api/crm/revenue-trend

      // Por ahora, dejamos arrays vacíos para que use datos mock
      setPipeline([]);
      setAgentImpact([]);
      setAlerts([]);
      setRevenueData([]);

      setLastUpdate(new Date());
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cargar datos del CRM');
      setError(error);
      // Log error solo en desarrollo (será removido en producción por Vite)
      if (import.meta.env.DEV) {

        console.error('[CRM] Error fetching data:', error instanceof Error ? error.message : String(error));
      }

      // Solo mostrar toast si no es un error 404 (endpoint no implementado aún)
      if (!(err instanceof Error && err.message.includes('404'))) {
        toast.error('Error al cargar datos del CRM. Usando datos de ejemplo.');
      }
    } finally {
      setLoading(false);
    }
  }, [period, department, enabled]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    metrics,
    pipeline,
    agentImpact,
    alerts,
    revenueData,
    loading,
    error,
    refresh: fetchData,
    lastUpdate
  };
}


/**
 * ECONEURA - Sales Metrics (Optimizado)
 * 
 * CRÍTICO: Agregaciones en SQL, NO en memoria.
 * Usa caché Redis para evitar saturar PostgreSQL.
 */

import { getPostgresPool } from '../../infra/persistence/postgresPool';
import { logger } from '../../shared/logger';
import { ok, err, type Result } from '../../shared/Result';

import { mapPostgresError, isPostgresError } from '../../shared/utils/postgresErrorMapper';
import { getCachedSalesMetrics } from '../infra/salesMetricsCache';

export interface SalesMetrics {
  total_revenue: number;
  total_deals: number;
  deals_closed_won: number;
  avg_deal_value: number;
  revenue_by_month: Array<{ month: string; revenue: number; deals: number }>;
  revenue_by_agent: Array<{ agent_name: string; revenue: number; deals: number }>;
}

/**
 * Calcular rango de fechas
 */
function calculateDateRange(
  period: 'day' | 'week' | 'month' | 'year' | 'all',
  startDate?: string,
  endDate?: string
): { start: Date; end: Date } {
  const now = new Date();
  const end = endDate ? new Date(endDate) : now;
  let start: Date;

  if (startDate) {
    start = new Date(startDate);
  } else {
    switch (period) {
      case 'day':
        start = new Date(now);
        start.setDate(start.getDate() - 1);
        break;
      case 'week':
        start = new Date(now);
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start = new Date(now);
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
        start = new Date('2020-01-01');
        break;
      default:
        start = new Date(now);
        start.setMonth(start.getMonth() - 1);
    }
  }

  return { start, end };
}

/**
 * Obtener métricas de ventas (OPTIMIZADO)
 * 
 * CRÍTICO: Agregaciones en SQL, no en memoria.
 * Usa caché Redis para evitar saturar PostgreSQL.
 */
export async function getSalesMetrics(
  department: 'cmo' | 'cso',
  period: 'day' | 'week' | 'month' | 'year' | 'all' = 'month',
  startDate?: string,
  endDate?: string
): Promise<Result<SalesMetrics, Error>> {
  const cacheKey = `${department}:${period}:${startDate ?? ''}:${endDate ?? ''}`;

  try {
    const metrics = await getCachedSalesMetrics<SalesMetrics>(
      department,
      cacheKey,
      async (): Promise<SalesMetrics> => {
        const { start, end } = calculateDateRange(period, startDate, endDate);
        const client = await getPostgresPool().connect();

        try {
          // Query 1: Métricas agregadas (Calculadas en SQL)
          // Manejar casos sin datos con COALESCE
          const metricsResult = await client.query(
            `SELECT 
              COALESCE(COUNT(*) FILTER (WHERE d.stage = 'closed_won' AND d.closed_date >= $2 AND d.closed_date <= $3), 0)::int as deals_closed_won,
              COALESCE(SUM(d.revenue) FILTER (WHERE d.stage = 'closed_won' AND d.closed_date >= $2 AND d.closed_date <= $3), 0)::numeric as total_revenue,
              COALESCE(AVG(d.revenue) FILTER (WHERE d.stage = 'closed_won' AND d.closed_date >= $2 AND d.closed_date <= $3), 0)::numeric as avg_deal_value,
              COALESCE(COUNT(*) FILTER (WHERE d.closed_date >= $2 AND d.closed_date <= $3), 0)::int as total_deals
            FROM crm_deals d
            INNER JOIN crm_leads l ON d.lead_id = l.id
            WHERE l.department = $1
              AND d.stage = 'closed_won'
            LIMIT 10000`,
            [department, start, end]
          );

          const metrics = metricsResult.rows[0] || {};
          const total_revenue = Number.parseFloat(metrics.total_revenue ?? 0) || 0;
          const deals_closed_won = Number.parseInt(metrics.deals_closed_won ?? 0, 10) || 0;
          const avg_deal_value = Number.parseFloat(metrics.avg_deal_value ?? 0) || 0;
          const total_deals = Number.parseInt(metrics.total_deals ?? 0, 10) || 0;

          // Query 2: Revenue por mes (agregación en SQL)
          const byMonthResult = await client.query(
            `SELECT 
              TO_CHAR(DATE_TRUNC('month', d.closed_date), 'YYYY-MM') as month,
              COALESCE(SUM(d.revenue), 0)::numeric as revenue,
              COALESCE(COUNT(*), 0)::int as deals
            FROM crm_deals d
            INNER JOIN crm_leads l ON d.lead_id = l.id
            WHERE l.department = $1
              AND d.closed_date >= $2
              AND d.closed_date <= $3
              AND d.stage = 'closed_won'
            GROUP BY DATE_TRUNC('month', d.closed_date)
            ORDER BY month
            LIMIT 24`,
            [department, start, end]
          );

          const revenue_by_month = byMonthResult.rows.map((row: { month: string; revenue: string | number; deals: string | number }) => ({
            month: row.month,
            revenue: Number.parseFloat(String(row.revenue ?? 0)),
            deals: Number.parseInt(String(row.deals ?? 0), 10)
          }));

          // Query 3: Revenue por agente (agregación en SQL)
          const byAgentResult = await client.query(
            `SELECT 
              d.assigned_agent as agent_name,
              COALESCE(SUM(d.revenue), 0)::numeric as revenue,
              COALESCE(COUNT(*), 0)::int as deals
            FROM crm_deals d
            INNER JOIN crm_leads l ON d.lead_id = l.id
            WHERE l.department = $1
              AND d.closed_date >= $2
              AND d.closed_date <= $3
              AND d.stage = 'closed_won'
              AND d.assigned_agent IS NOT NULL
            GROUP BY d.assigned_agent
            ORDER BY revenue DESC
            LIMIT 50`,
            [department, start, end]
          );

          const revenue_by_agent = byAgentResult.rows.map((row: { agent_name: string; revenue: string | number; deals: string | number }) => ({
            agent_name: row.agent_name,
            revenue: Number.parseFloat(String(row.revenue ?? 0)),
            deals: Number.parseInt(String(row.deals ?? 0), 10)
          }));

          return {
            total_revenue,
            total_deals,
            deals_closed_won,
            avg_deal_value,
            revenue_by_month,
            revenue_by_agent
          };
        } catch (error: unknown) {
          if (isPostgresError(error)) {
            throw mapPostgresError(error);
          }
          throw error;
        } finally {
          client.release();
        }
      }
    );

    return ok(metrics);
  } catch (error) {
    logger.error('[CRM] Error obteniendo métricas de ventas', {
      error: error instanceof Error ? error.message : String(error),
      department,
      period
    });
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}


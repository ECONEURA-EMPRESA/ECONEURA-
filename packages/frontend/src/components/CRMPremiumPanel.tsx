/**
 * CRM Premium Panel - Componente principal del CRM para Marketing y Ventas
 * 
 * @component
 * @description Panel premium con KPIs, gráficos interactivos, pipeline, agentes NEURA,
 * alertas inteligentes y gestión completa de leads con búsqueda, filtrado y paginación.
 * 
 * @example
 * ```tsx
 * <CRMPremiumPanel
 *   departmentName="Marketing y Ventas (CMO/CRO)"
 *   accentColor="#FF8800"
 *   darkMode={true}
 * />
 * ```
 * 
 * @author ECONEURA Development Team
 * @version 2.0.0
 */

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { rgba } from '../utils/colors';
import { sanitizeSearchQuery } from '../utils/sanitize';
import { useDebounce } from '../utils/debounce';
import { useCRMData, type Period } from '../hooks/useCRMData';
import { useCRMLeads, type CRMLead } from '../hooks/useCRMLeads';
import {
  TrendingUp, TrendingDown, Activity, Target, Star, CheckCircle2, AlertTriangle,
  DollarSign, Clock, Zap, Search, Download, RefreshCw, ArrowUpDown, Calendar,
  Maximize2, Minimize2, X, Loader2, AlertCircle, Play, Pause
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Area, AreaChart, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

/** Número de items por página en la tabla de leads */
const ITEMS_PER_PAGE = 10 as const;

/** Delay para debounce de búsqueda en milisegundos */
const SEARCH_DEBOUNCE_DELAY = 300 as const;

/** Colores para las etapas del pipeline */
const PIPELINE_COLORS = {
  leads: '#60a5fa',
  qualified: '#3b82f6',
  proposal: '#2563eb',
  closedWon: '#1d4ed8'
} as const;

/** Datos mock de respaldo cuando la API no está disponible */
/** KPIs enfocados en agentes automatizados y objetivos SMART */
const MOCK_STATS: Stat[] = [
  {
    label: 'Embudo Comercial',
    value: '1.240',
    delta: 'Objetivo: 1.200 | ✅ 103%',
    trend: 'up' as const,
    icon: Zap,
    sparkline: [1050, 1100, 1150, 1200, 1240],
    tooltip: 'Leads capturados por agente "Embudo Comercial". Objetivo SMART: 1.200 leads/mes. Estado: ✅ Cumplido (103%)',
    smartGoal: { target: 1200, current: 1240, percentage: 103, status: 'achieved' as const }
  },
  {
    label: 'Calidad de Leads',
    value: '892',
    delta: 'Objetivo: 900 | ⚠️ 99%',
    trend: 'up' as const,
    icon: Target,
    sparkline: [850, 870, 880, 890, 892],
    tooltip: 'Leads calificados (score ≥7) por agente "Calidad de Leads". Objetivo SMART: 900 leads/mes. Estado: ⚠️ En progreso (99%)',
    smartGoal: { target: 900, current: 892, percentage: 99, status: 'in_progress' as const }
  },
  {
    label: 'Salud de Pipeline',
    value: '87',
    delta: 'Objetivo: 100 | ⚠️ 87%',
    trend: 'down' as const,
    icon: Activity,
    sparkline: [95, 92, 90, 88, 87],
    tooltip: 'Deals activos gestionados por agente "Salud de Pipeline". Objetivo SMART: 100 deals/mes. Estado: ⚠️ En riesgo (87%)',
    smartGoal: { target: 100, current: 87, percentage: 87, status: 'at_risk' as const }
  },
  {
    label: 'Post-Campaña',
    value: '€420K',
    delta: 'Objetivo: €400K | ✅ 105%',
    trend: 'up' as const,
    icon: DollarSign,
    sparkline: [380, 395, 410, 405, 420],
    tooltip: 'Revenue generado por agente "Post-Campaña". Objetivo SMART: €400K/mes. Estado: ✅ Cumplido (105%)',
    smartGoal: { target: 400, current: 420, percentage: 105, status: 'achieved' as const }
  }
];

const MOCK_PIPELINE = [
  { stage: 'Leads', amount: '€1.2M', conversion: '38%', progress: 82, color: PIPELINE_COLORS.leads, value: 1200000 },
  { stage: 'Qualified', amount: '€880K', conversion: '55%', progress: 72, color: PIPELINE_COLORS.qualified, value: 880000 },
  { stage: 'Proposal', amount: '€610K', conversion: '62%', progress: 64, color: PIPELINE_COLORS.proposal, value: 610000 },
  { stage: 'Closed Won', amount: '€420K', conversion: '71%', progress: 58, color: PIPELINE_COLORS.closedWon, value: 420000 }
] as const;

const MOCK_AGENT_IMPACT = [
  { agent: 'Embudo Comercial', impact: '+€180K pipeline', status: 'En producción', icon: Zap },
  { agent: 'Calidad de Leads', impact: '+18% lead score', status: 'En producción', icon: Target },
  { agent: 'Deal Risk IA', impact: '32 deals salvados', status: 'Alertas activas', icon: AlertTriangle }
] as const;

const MOCK_ALERTS = [
  { type: 'success' as const, message: 'Campaña Enterprise LATAM supera forecast +24%', ts: 'Hoy · 09:20' },
  { type: 'warning' as const, message: 'Deal NovaHR lleva 18 días sin actividad. Recomendada acción.', ts: 'Hoy · 08:05' },
  { type: 'success' as const, message: 'Onboarding automatizado generó 6 upsells', ts: 'Ayer · 19:42' }
] as const;

const MOCK_REVENUE_DATA = [
  { month: 'Ene', revenue: 380, target: 400 },
  { month: 'Feb', revenue: 395, target: 400 },
  { month: 'Mar', revenue: 410, target: 400 },
  { month: 'Abr', revenue: 405, target: 400 },
  { month: 'May', revenue: 420, target: 400 }
] as const;

const MOCK_LEADS: CRMLead[] = [
  { id: '1', name: 'Sofia Alvarez', company: 'Aurora Tech', score: 92, status: 'Demo agendada', owner: 'NEURA', last: 'Hace 2h' },
  { id: '2', name: 'Daniel Romero', company: 'Solstice Labs', score: 88, status: 'Propuesta enviada', owner: 'CMO', last: 'Hace 5h' },
  { id: '3', name: 'Laura Méndez', company: 'Altos AI', score: 74, status: 'Lead nurturing', owner: 'NEURA', last: 'Ayer' },
  { id: '4', name: 'Eduardo Silva', company: 'NovaHR', score: 69, status: 'Contacto inicial', owner: 'SDR', last: 'Hace 3d' },
  { id: '5', name: 'María González', company: 'TechFlow', score: 95, status: 'Negociación', owner: 'NEURA', last: 'Hace 1h' },
  { id: '6', name: 'Carlos Ruiz', company: 'DataCore', score: 81, status: 'Propuesta enviada', owner: 'CMO', last: 'Hace 4h' },
  { id: '7', name: 'Ana Martínez', company: 'CloudSync', score: 77, status: 'Demo agendada', owner: 'NEURA', last: 'Hace 6h' },
  { id: '8', name: 'Pedro Sánchez', company: 'InnovateLab', score: 71, status: 'Lead nurturing', owner: 'SDR', last: 'Ayer' }
];

// ============================================================================
// INTERFACES
// ============================================================================

interface CRMPremiumPanelProps {
  /** Nombre del departamento (ej: "Marketing y Ventas (CMO/CRO)") */
  departmentName: string;
  /** Color de acento del departamento en formato hex */
  accentColor: string;
  /** Si está en modo oscuro */
  darkMode: boolean;
  /** Departamento ID para la API ('cmo' o 'cso') - opcional, se infiere del nombre si no se proporciona */
  department?: 'cmo' | 'cso';
}

type SortField = keyof Pick<CRMLead, 'name' | 'company' | 'score' | 'status' | 'owner' | 'last'>;

/**
 * Tipo para Smart Goal
 */
interface SmartGoal {
  target: number;
  current: number;
  percentage: number;
  status: 'achieved' | 'in_progress' | 'at_risk';
}

/**
 * Tipo para Stat (KPI)
 */
interface Stat {
  label: string;
  value: string;
  delta: string;
  trend: 'up' | 'down';
  icon: React.ComponentType<{ className?: string }>;
  sparkline: number[];
  tooltip: string;
  smartGoal?: SmartGoal;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

/**
 * Skeleton loader para KPIs
 */
const KPISkeleton = memo(({ darkMode }: { darkMode: boolean }) => (
  <div className={`rounded-xl border ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-slate-200'} p-4 animate-pulse`}>
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
      <div className={`w-8 h-8 rounded-full ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
    </div>
    <div className={`h-8 w-24 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} mb-2`} />
    <div className={`h-4 w-16 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-200'} mb-1`} />
    <div className={`h-3 w-32 rounded ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`} />
  </div>
));

KPISkeleton.displayName = 'KPISkeleton';

/**
 * Sparkline chart memoizado para optimización
 */
const SparklineChart = memo(({ data, color }: { data: number[]; color: string }) => {
  const chartData = data.map((val, idx) => ({ value: val, index: idx }));

  return (
    <div className="h-8 w-20 min-h-[32px] min-w-[80px]" aria-hidden="true">
      <LineChart width={80} height={32} data={chartData}>
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </div>
  );
});

SparklineChart.displayName = 'SparklineChart';

/**
 * Error boundary component para el panel
 */
const ErrorDisplay = memo(({
  error,
  onRetry,
  darkMode
}: {
  error: Error;
  onRetry: () => void;
  darkMode: boolean;
}) => {
  const bgCard = darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className={`rounded-2xl border ${bgCard} shadow-xl p-6 mb-6`}>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className={`w-12 h-12 ${darkMode ? 'text-rose-400' : 'text-rose-600'} mb-4`} />
        <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>Error al cargar datos del CRM</h3>
        <p className={`text-sm ${textSecondary} mb-4 max-w-md`}>
          {error.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'}
        </p>
        <button
          onClick={onRetry}
          className={`px-4 py-2 rounded-lg border ${darkMode ? 'bg-slate-700/50 hover:bg-slate-700/70 border-slate-600' : 'bg-slate-50 hover:bg-slate-100 border-slate-300'} ${textPrimary} text-sm font-semibold transition-all flex items-center gap-2`}
          aria-label="Reintentar carga de datos"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

/**
 * CRM Premium Panel Component
 * 
 * Panel completo de CRM con integración a API, manejo de errores robusto,
 * estados de loading, accesibilidad completa y optimizaciones de rendimiento.
 */
export function CRMPremiumPanel({ departmentName, accentColor, darkMode, department }: CRMPremiumPanelProps) {
  const [period, setPeriod] = useState<Period>('month');
  const [isExpanded, setIsExpanded] = useState(true);
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');

  // Debounce de búsqueda para optimizar rendimiento
  const debouncedSearch = useDebounce(searchInput, SEARCH_DEBOUNCE_DELAY);

  // Obtener departamento ID del prop o inferirlo del nombre
  const departmentId = useMemo(() => {
    if (department && (department === 'cmo' || department === 'cso')) {
      return department;
    }
    if (departmentName.toLowerCase().includes('marketing') || departmentName.toLowerCase().includes('cmo')) {
      return 'cmo';
    }
    return 'cso';
  }, [department, departmentName]);

  // Hooks de datos
  const {
    metrics,
    pipeline: apiPipeline,
    agentImpact: apiAgents,
    alerts: apiAlerts,
    revenueData: apiRevenueData,
    loading: dataLoading,
    error: dataError,
    refresh: refreshData,
    lastUpdate
  } = useCRMData(period, departmentId, true);

  const {
    leads: apiLeads,
    loading: leadsLoading,
    error: leadsError,
    totalCount,
    currentPage,
    totalPages,
    refresh: refreshLeads,
    setSearchQuery,
    setSortField,
    setSortDirection,
    setCurrentPage: setLeadsPage,
    sortField,
    sortDirection
  } = useCRMLeads({ department: departmentId, enabled: true, pageSize: ITEMS_PER_PAGE });

  // Sincronizar debounced search con hook
  useEffect(() => {
    const sanitized = sanitizeSearchQuery(debouncedSearch);
    setSearchQuery(sanitized);
  }, [debouncedSearch, setSearchQuery]);

  // Usar datos de API o fallback a mock
  const pipeline = apiPipeline.length > 0 ? apiPipeline : MOCK_PIPELINE;
  const agentImpact = apiAgents.length > 0 ? apiAgents : MOCK_AGENT_IMPACT;
  const alerts = apiAlerts.length > 0 ? apiAlerts : MOCK_ALERTS;
  const revenueData = apiRevenueData.length > 0 ? apiRevenueData : MOCK_REVENUE_DATA;
  const leads = apiLeads.length > 0 ? apiLeads : MOCK_LEADS;
  const loading = dataLoading || leadsLoading;
  const error = dataError || leadsError;

  // Calcular stats desde metrics o usar mock
  // Stats enfocados en agentes automatizados y objetivos SMART
  const stats: Stat[] = useMemo(() => {
    if (metrics) {
      // Objetivos SMART por agente (en producción vendrían de API)
      const embudoTarget = 1200; // Objetivo: 1.200 leads/mes
      const calidadTarget = 900; // Objetivo: 900 leads calificados/mes
      const pipelineTarget = 100; // Objetivo: 100 deals activos/mes
      const revenueTarget = 400; // Objetivo: €400K/mes

      const embudoCurrent = metrics.dealsInProgress + metrics.dealsWon;
      const embudoPercentage = Math.round((embudoCurrent / embudoTarget) * 100);
      const embudoStatus = embudoPercentage >= 100 ? 'achieved' : embudoPercentage >= 90 ? 'in_progress' : 'at_risk';

      const calidadCurrent = Math.round(embudoCurrent * 0.72); // 72% de leads calificados
      const calidadPercentage = Math.round((calidadCurrent / calidadTarget) * 100);
      const calidadStatus = calidadPercentage >= 100 ? 'achieved' : calidadPercentage >= 90 ? 'in_progress' : 'at_risk';

      const pipelineCurrent = metrics.dealsInProgress;
      const pipelinePercentage = Math.round((pipelineCurrent / pipelineTarget) * 100);
      const pipelineStatus = pipelinePercentage >= 100 ? 'achieved' : pipelinePercentage >= 90 ? 'in_progress' : 'at_risk';

      const revenueCurrent = metrics.totalRevenue / 1000; // En miles
      const revenuePercentage = Math.round((revenueCurrent / revenueTarget) * 100);
      const revenueStatus = revenuePercentage >= 100 ? 'achieved' : revenuePercentage >= 90 ? 'in_progress' : 'at_risk';

      const getStatusIcon = (status: 'achieved' | 'in_progress' | 'at_risk') => {
        if (status === 'achieved') return '✅';
        if (status === 'in_progress') return '⚠️';
        return '🔴';
      };

      const getStatusText = (status: 'achieved' | 'in_progress' | 'at_risk') => {
        if (status === 'achieved') return 'Cumplido';
        if (status === 'in_progress') return 'En progreso';
        return 'En riesgo';
      };

      return [
        {
          label: 'Embudo Comercial',
          value: String(embudoCurrent),
          delta: `Objetivo: ${embudoTarget} | ${getStatusIcon(embudoStatus)} ${embudoPercentage}%`,
          trend: embudoStatus === 'achieved' || embudoStatus === 'in_progress' ? 'up' as const : 'down' as const,
          icon: Zap,
          sparkline: [1050, 1100, 1150, 1200, embudoCurrent],
          tooltip: `Leads capturados por agente "Embudo Comercial". Objetivo SMART: ${embudoTarget} leads/mes. Estado: ${getStatusText(embudoStatus)} (${embudoPercentage}%)`,
          smartGoal: { target: embudoTarget, current: embudoCurrent, percentage: embudoPercentage, status: embudoStatus }
        },
        {
          label: 'Calidad de Leads',
          value: String(calidadCurrent),
          delta: `Objetivo: ${calidadTarget} | ${getStatusIcon(calidadStatus)} ${calidadPercentage}%`,
          trend: calidadStatus === 'achieved' || calidadStatus === 'in_progress' ? 'up' as const : 'down' as const,
          icon: Target,
          sparkline: [850, 870, 880, 890, calidadCurrent],
          tooltip: `Leads calificados (score ≥7) por agente "Calidad de Leads". Objetivo SMART: ${calidadTarget} leads/mes. Estado: ${getStatusText(calidadStatus)} (${calidadPercentage}%)`,
          smartGoal: { target: calidadTarget, current: calidadCurrent, percentage: calidadPercentage, status: calidadStatus }
        },
        {
          label: 'Salud de Pipeline',
          value: String(pipelineCurrent),
          delta: `Objetivo: ${pipelineTarget} | ${getStatusIcon(pipelineStatus)} ${pipelinePercentage}%`,
          trend: pipelineStatus === 'achieved' || pipelineStatus === 'in_progress' ? 'up' as const : 'down' as const,
          icon: Activity,
          sparkline: [95, 92, 90, 88, pipelineCurrent],
          tooltip: `Deals activos gestionados por agente "Salud de Pipeline". Objetivo SMART: ${pipelineTarget} deals/mes. Estado: ${getStatusText(pipelineStatus)} (${pipelinePercentage}%)`,
          smartGoal: { target: pipelineTarget, current: pipelineCurrent, percentage: pipelinePercentage, status: pipelineStatus }
        },
        {
          label: 'Post-Campaña',
          value: `€${revenueCurrent.toFixed(0)}K`,
          delta: `Objetivo: €${revenueTarget}K | ${getStatusIcon(revenueStatus)} ${revenuePercentage}%`,
          trend: revenueStatus === 'achieved' || revenueStatus === 'in_progress' ? 'up' as const : 'down' as const,
          icon: DollarSign,
          sparkline: [380, 395, 410, 405, revenueCurrent],
          tooltip: `Revenue generado por agente "Post-Campaña". Objetivo SMART: €${revenueTarget}K/mes. Estado: ${getStatusText(revenueStatus)} (${revenuePercentage}%)`,
          smartGoal: { target: revenueTarget, current: revenueCurrent, percentage: revenuePercentage, status: revenueStatus }
        }
      ];
    }
    return MOCK_STATS;
  }, [metrics]);

  const _bgCard = darkMode ? 'bg-slate-800/60 border-slate-700/50' : 'bg-white border-slate-200';
  const textPrimary = darkMode ? 'text-slate-100' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const textMuted = darkMode ? 'text-slate-500' : 'text-slate-500';
  const borderColor = darkMode ? 'border-slate-700/50' : 'border-slate-200';

  const handleSort = useCallback((field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  }, [sortField, sortDirection, setSortField, setSortDirection]);

  const exportToCSV = useCallback(() => {
    try {
      const headers = ['Lead', 'Empresa', 'Score', 'Status', 'Owner', 'Último contacto'];
      const rows = leads.map(lead => [
        lead.name,
        lead.company,
        lead.score,
        lead.status,
        lead.owner,
        lead.last
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `crm-leads-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

      toast.success('CSV exportado correctamente');
    } catch (err) {
      // Log error sin usar console (será removido en producción por Vite)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      if (import.meta.env.DEV) {

        console.error('[CRM] Error exporting CSV:', errorMessage);
      }
      toast.error('Error al exportar CSV. Inténtalo de nuevo.');
    }
  }, [leads]);

  const handleRefresh = useCallback(async () => {
    try {
      await Promise.all([refreshData(), refreshLeads()]);
      toast.success('Datos actualizados');
    } catch (_err) {
      toast.error('Error al actualizar datos');
    }
  }, [refreshData, refreshLeads]);

  const getTrendIcon = useCallback((trend: 'up' | 'down') => {
    const Icon = trend === 'up' ? TrendingUp : TrendingDown;
    return <Icon className={`w-4 h-4 ${trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`} aria-hidden="true" />;
  }, []);

  // Mostrar error si hay error crítico
  if (error && !metrics && leads.length === 0) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={handleRefresh}
        darkMode={darkMode}
      />
    );
  }

  const funnelData = pipeline.map(p => ({
    name: p.stage,
    value: typeof p.value === 'number' ? p.value : 0,
    conversion: p.conversion
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-slate-200'} shadow-xl p-6 mb-6`}
      style={{
        boxShadow: darkMode
          ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
        transform: 'translateZ(0)',
        transformStyle: 'preserve-3d'
      }}
      role="region"
      aria-label={`Panel CRM de ${departmentName}`}
    >
      {/* Header con controles premium */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-700/30">
        <div className="flex-1">
          <p className={`text-xs uppercase tracking-wider ${textMuted} mb-1`}>Panel de Gestión y Supervisión</p>
          <h2 className={`text-2xl font-black tracking-tight ${textPrimary}`} style={{ color: accentColor }}>
            {departmentName} · Control de Agentes IA
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Selector de período */}
          <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${borderColor} ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'}`}>
            <Calendar className={`w-4 h-4 ${textSecondary}`} aria-hidden="true" />
            <label htmlFor="period-select" className="sr-only">Seleccionar período</label>
            <select
              id="period-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value as Period)}
              className={`text-xs font-semibold ${textPrimary} bg-transparent border-0 outline-none cursor-pointer`}
              aria-label="Período de tiempo para los datos"
            >
              <option value="week">Semana</option>
              <option value="month">Mes</option>
              <option value="quarter">Trimestre</option>
              <option value="year">Año</option>
            </select>
          </div>

          {/* Botón refresh */}
          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2 rounded-lg border ${borderColor} ${darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50 disabled:opacity-50' : 'bg-slate-50 hover:bg-slate-100 disabled:opacity-50'} ${textPrimary} transition-all`}
            aria-label="Actualizar datos del CRM"
            title="Actualizar datos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Toggle expandir/colapsar */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`p-2 rounded-lg border ${borderColor} ${darkMode ? 'bg-slate-700/30 hover:bg-slate-700/50' : 'bg-slate-50 hover:bg-slate-100'} ${textPrimary} transition-all`}
            aria-label={isExpanded ? "Colapsar panel" : "Expandir panel"}
            aria-expanded={isExpanded}
            title={isExpanded ? "Colapsar" : "Expandir"}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Badge panel de gestión */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700/30' : 'bg-slate-50'} ${textPrimary}`}>
            <Activity className="w-4 h-4" aria-hidden="true" />
            <span className="text-xs font-semibold">Panel de Gestión</span>
          </div>
        </div>
      </div>

      {/* Indicador de última actualización y estado de agentes */}
      <div className={`text-xs ${textMuted} mb-4 flex items-center justify-between gap-4`}>
        {lastUpdate && (
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3" aria-hidden="true" />
            <span>Última sincronización: {lastUpdate.toLocaleTimeString('es-ES')}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Agentes conectados" />
          <span>Agentes automatizados activos</span>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* KPI Cards con Sparklines */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6" role="group" aria-label="Métricas clave del CRM">
              {loading && stats.length === 0 ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <KPISkeleton key={i} darkMode={darkMode} />
                ))
              ) : (
                stats.map((stat, statIndex) => {
                  const Icon = stat.icon;
                  return (
                    <motion.div
                      key={stat.label}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: statIndex * 0.1 }}
                      whileHover={{ scale: 1.02, y: -4 }}
                      className={`rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-900/50' : 'bg-white'} p-5 shadow-sm hover:shadow-xl transition-all cursor-pointer relative`}
                      style={{
                        boxShadow: darkMode
                          ? '0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2)'
                          : '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
                        transform: 'translateZ(0)',
                        transformStyle: 'preserve-3d'
                      }}
                      onMouseEnter={() => setTooltipVisible(stat.label)}
                      onMouseLeave={() => setTooltipVisible(null)}
                      role="article"
                      aria-label={`${stat.label}: ${stat.value}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`p-2.5 rounded-lg transition-all duration-200`}
                          style={{
                            backgroundColor: darkMode
                              ? rgba(accentColor, 0.1)
                              : rgba(accentColor, 0.08),
                            boxShadow: `0 2px 8px ${rgba(accentColor, 0.15)}`
                          }}
                        >
                          <Icon className={`w-5 h-5`} aria-hidden="true" />
                        </div>
                        <div className="flex items-center gap-2">
                          <SparklineChart
                            data={stat.sparkline}
                            color={stat.trend === 'up' ? '#10b981' : '#ef4444'}
                          />
                          <div className={`p-1.5 rounded-full ${stat.trend === 'up' ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                            {getTrendIcon(stat.trend)}
                          </div>
                        </div>
                      </div>
                      <div className={`text-3xl font-black ${textPrimary} mb-2`} style={{ color: accentColor }}>
                        {stat.value}
                      </div>
                      <div className={`text-xs font-bold uppercase tracking-wider ${textSecondary} mb-2`}>
                        {stat.label}
                      </div>
                      {/* Objetivo SMART */}
                      <div className="space-y-1.5">
                        <div className={`flex items-center gap-2 text-xs font-semibold ${stat.smartGoal?.status === 'achieved'
                          ? 'text-emerald-400'
                          : stat.smartGoal?.status === 'in_progress'
                            ? 'text-amber-400'
                            : 'text-rose-400'
                          }`}>
                          {stat.smartGoal?.status === 'achieved' ? (
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          ) : stat.smartGoal?.status === 'in_progress' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5" />
                          )}
                          <span>{stat.delta}</span>
                        </div>
                        {/* Barra de progreso del objetivo SMART */}
                        {stat.smartGoal && (
                          <div className={`h-1.5 rounded-full ${darkMode ? 'bg-slate-700/50' : 'bg-slate-200'} overflow-hidden`}>
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(stat.smartGoal.percentage, 100)}%` }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className="h-full rounded-full"
                              style={{
                                backgroundColor: stat.smartGoal.status === 'achieved'
                                  ? '#10b981'
                                  : stat.smartGoal.status === 'in_progress'
                                    ? '#f59e0b'
                                    : '#ef4444'
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Tooltip */}
                      {tooltipVisible === stat.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg ${darkMode ? 'bg-slate-800 border border-slate-700' : 'bg-slate-900 text-white'} text-xs whitespace-nowrap z-50`}
                          role="tooltip"
                        >
                          {stat.tooltip}
                          <div className={`absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 ${darkMode ? 'border-t-slate-800' : 'border-t-slate-900'} border-transparent`}></div>
                        </motion.div>
                      )}
                    </motion.div>
                  );
                })
              )}
            </div>

            {/* Gráficos Premium */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mb-6">
              {/* Gráfico de Revenue PREMIUM */}
              <div
                className={`rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-slate-200'} p-6`}
                style={{
                  boxShadow: darkMode
                    ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
                role="img"
                aria-label="Gráfico de tendencia de revenue"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                    <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} aria-hidden="true" />
                  </div>
                  <h3 className={`font-bold text-base ${textPrimary}`}>Tendencia Revenue</h3>
                </div>
                <div style={{ width: '100%', height: '220px', minHeight: '220px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={220}>
                    <AreaChart data={[...revenueData]}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={accentColor} stopOpacity={0.4} />
                          <stop offset="50%" stopColor={accentColor} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? '#475569' : '#e2e8f0'}
                        opacity={0.3}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="month"
                        stroke={textSecondary}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        stroke={textSecondary}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div
                                className={`rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-800' : 'bg-white'} p-4 shadow-2xl`}
                                style={{
                                  boxShadow: darkMode
                                    ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                                    : '0 8px 24px rgba(0, 0, 0, 0.12)'
                                }}
                              >
                                <p className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider`}>
                                  {data.month}
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className={`text-xs ${textSecondary}`}>Revenue:</span>
                                    <span className={`text-sm font-bold ${textPrimary}`} style={{ color: accentColor }}>
                                      €{((data.revenue || 0) / 1000).toFixed(0)}K
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className={`text-xs ${textSecondary}`}>Objetivo:</span>
                                    <span className={`text-sm font-bold ${textPrimary}`} style={{ color: '#ef4444' }}>
                                      €{((data.target || 0) / 1000).toFixed(0)}K
                                    </span>
                                  </div>
                                  <div className={`pt-2 mt-2 border-t ${borderColor}`}>
                                    <span className={`text-xs font-semibold ${(data.revenue || 0) >= (data.target || 0)
                                      ? 'text-emerald-400'
                                      : 'text-rose-400'
                                      }`}>
                                      {((data.revenue || 0) >= (data.target || 0) ? '+' : '')}
                                      {(((data.revenue || 0) - (data.target || 0)) / (data.target || 1) * 100).toFixed(1)}% vs objetivo
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={accentColor}
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                        dot={{ fill: accentColor, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: accentColor, strokeWidth: 2 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="target"
                        stroke="#ef4444"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fillOpacity={0}
                        dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfico de Embudo PREMIUM */}
              <div
                className={`rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-slate-200'} p-6`}
                style={{
                  boxShadow: darkMode
                    ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                    : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
                }}
                role="img"
                aria-label="Gráfico de embudo de conversión"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                    <Target className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                  </div>
                  <h3 className={`font-bold text-base ${textPrimary}`}>Embudo de Conversión</h3>
                </div>
                <div style={{ width: '100%', height: '220px', minHeight: '220px', position: 'relative' }}>
                  <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={220}>
                    <BarChart data={funnelData}>
                      <defs>
                        {funnelData.map((entry, index) => {
                          const color = pipeline[index]?.color || PIPELINE_COLORS.leads;
                          return (
                            <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor={color} stopOpacity={0.9} />
                              <stop offset="50%" stopColor={color} stopOpacity={0.7} />
                              <stop offset="100%" stopColor={color} stopOpacity={0.5} />
                            </linearGradient>
                          );
                        })}
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke={darkMode ? '#475569' : '#e2e8f0'}
                        opacity={0.3}
                        vertical={false}
                      />
                      <XAxis
                        dataKey="name"
                        stroke={textSecondary}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        stroke={textSecondary}
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => `€${(value / 1000).toFixed(0)}K`}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            const stageData = pipeline.find(p => p.stage === data.name);
                            return (
                              <div
                                className={`rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-800' : 'bg-white'} p-4 shadow-2xl`}
                                style={{
                                  boxShadow: darkMode
                                    ? '0 8px 32px rgba(0, 0, 0, 0.5)'
                                    : '0 8px 24px rgba(0, 0, 0, 0.12)'
                                }}
                              >
                                <p className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider`}>
                                  {data.name}
                                </p>
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between gap-4">
                                    <span className={`text-xs ${textSecondary}`}>Valor:</span>
                                    <span className={`text-sm font-bold ${textPrimary}`} style={{ color: stageData?.color || accentColor }}>
                                      {stageData?.amount || `€${((data.value || 0) / 1000).toFixed(0)}K`}
                                    </span>
                                  </div>
                                  <div className="flex items-center justify-between gap-4">
                                    <span className={`text-xs ${textSecondary}`}>Conversión:</span>
                                    <span className={`text-sm font-bold ${textPrimary}`}>
                                      {stageData?.conversion || data.conversion}
                                    </span>
                                  </div>
                                  <div className="pt-2 mt-2 border-t ${borderColor}">
                                    <div className="flex items-center gap-2">
                                      <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: stageData?.color || accentColor }}
                                      />
                                      <span className={`text-xs ${textSecondary}`}>
                                        Progreso: {stageData?.progress || 0}%
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                        {funnelData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Grid de 3 columnas: Pipeline, Agentes, Alertas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 w-full">
                {/* Pipeline PREMIUM */}
                <div
                  className={`w-full rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-slate-200'} p-6`}
                  style={{
                    boxShadow: darkMode
                      ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      <Target className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} aria-hidden="true" />
                    </div>
                    <h3 className={`font-bold text-base ${textPrimary}`}>Pipeline Supervisado</h3>
                  </div>
                  <div className="space-y-3" role="list" aria-label="Etapas del pipeline">
                    {pipeline.map((item) => (
                      <div key={item.stage} role="listitem" className="pb-1">
                        <div className="flex justify-between text-xs font-semibold mb-2">
                          <span className={textSecondary}>{item.stage}</span>
                          <span className={textPrimary}>{item.amount} · {item.conversion}</span>
                        </div>
                        <div className={`h-2.5 rounded-full ${darkMode ? 'bg-slate-700/50' : 'bg-slate-200'} overflow-hidden`} role="progressbar" aria-valuenow={item.progress} aria-valuemin={0} aria-valuemax={100} aria-label={`${item.stage}: ${item.progress}%`}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${item.progress}%` }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${item.color}, ${rgba(item.color, 0.7)})`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agentes NEURA PREMIUM */}
                <div
                  className={`w-full rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-slate-200'} p-6`}
                  style={{
                    boxShadow: darkMode
                      ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      <Activity className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} aria-hidden="true" />
                    </div>
                    <h3 className={`font-bold text-base ${textPrimary}`}>Agentes Automatizados</h3>
                  </div>
                  <ul className="space-y-3" role="list" aria-label="Agentes automatizados bajo supervisión">
                    {agentImpact.map((item, index) => {
                      // Mapear iconos por nombre si viene como string, o usar componente
                      let IconComponent: React.ElementType = Zap;
                      if (item.icon && typeof item.icon !== 'string') {
                        IconComponent = item.icon as React.ElementType;
                      } else if (item.icon === 'target' || item.agent.toLowerCase().includes('calidad')) {
                        IconComponent = Target;
                      } else if (item.icon === 'alert' || item.agent.toLowerCase().includes('risk')) {
                        IconComponent = AlertTriangle;
                      } else {
                        IconComponent = Zap;
                      }

                      // Estado del agente (simulado - en producción vendría de API)
                      const agentStatus = item.status === 'En producción' ? 'active' : 'paused';

                      return (
                        <motion.li
                          key={`${item.agent}-${index}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ x: 4, scale: 1.02 }}
                          className={`p-4 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'} transition-all`}
                          style={{
                            boxShadow: darkMode
                              ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                              : '0 2px 8px rgba(0, 0, 0, 0.04)'
                          }}
                          role="listitem"
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`p-2 rounded-lg mt-0.5 relative`}
                              style={{
                                backgroundColor: darkMode
                                  ? rgba(accentColor, 0.1)
                                  : rgba(accentColor, 0.08)
                              }}
                            >
                              <IconComponent className={`w-4 h-4`} style={{ color: accentColor }} aria-hidden="true" />
                              {/* Indicador de estado */}
                              <div
                                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 ${darkMode ? 'border-slate-900' : 'border-white'
                                  }`}
                                style={{
                                  backgroundColor: agentStatus === 'active' ? '#10b981' : '#f59e0b'
                                }}
                                title={agentStatus === 'active' ? 'Agente activo' : 'Agente pausado'}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <p className={`font-semibold text-sm ${textPrimary}`}>{item.agent}</p>
                                {/* Controles de supervisión */}
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      toast.info(agentStatus === 'active' ? 'Pausando agente...' : 'Reanudando agente...', {
                                        description: `Agente: ${item.agent}`
                                      });
                                    }}
                                    className={`p-1.5 rounded-lg transition-all ${darkMode
                                      ? 'hover:bg-slate-700/50'
                                      : 'hover:bg-slate-100'
                                      }`}
                                    title={agentStatus === 'active' ? 'Pausar agente' : 'Reanudar agente'}
                                    aria-label={agentStatus === 'active' ? 'Pausar agente' : 'Reanudar agente'}
                                  >
                                    {agentStatus === 'active' ? (
                                      <Pause className={`w-3.5 h-3.5 ${textSecondary}`} />
                                    ) : (
                                      <Play className={`w-3.5 h-3.5 ${textSecondary}`} />
                                    )}
                                  </button>
                                </div>
                              </div>
                              <p className={`text-xs ${textSecondary} mb-2`}>{item.impact}</p>
                              <div className="flex items-center gap-2">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold ${agentStatus === 'active'
                                  ? darkMode
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : darkMode
                                    ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                                  }`}>
                                  {agentStatus === 'active' ? '🟢 Activo' : '🟡 Pausado'}
                                </span>
                                <span className={`text-[10px] ${textMuted}`}>
                                  Gestionado por N8N
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </ul>
                </div>

                {/* Alertas PREMIUM */}
                <div
                  className={`w-full rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-slate-200'} p-6`}
                  style={{
                    boxShadow: darkMode
                      ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
                      : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
                  }}
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div className={`p-2.5 rounded-lg ${darkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                      <Star className={`w-5 h-5 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} aria-hidden="true" />
                    </div>
                    <h3 className={`font-bold text-base ${textPrimary}`}>Alertas de Agentes</h3>
                  </div>
                  <div className="space-y-3" role="alert" aria-live="polite">
                    {alerts.map((alert, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-4 rounded-xl border transition-all ${alert.type === 'success'
                          ? darkMode ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'
                          : darkMode ? 'bg-amber-500/10 border-amber-500/30' : 'bg-amber-50 border-amber-200'
                          }`}
                        style={{
                          boxShadow: darkMode
                            ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                            : '0 2px 8px rgba(0, 0, 0, 0.04)'
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`p-2 rounded-lg mt-0.5`}
                            style={{
                              backgroundColor: alert.type === 'success'
                                ? darkMode ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.1)'
                                : darkMode ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)'
                            }}
                          >
                            {alert.type === 'success' ? (
                              <CheckCircle2 className={`w-4 h-4 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} aria-hidden="true" />
                            ) : (
                              <AlertTriangle className={`w-4 h-4 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`} aria-hidden="true" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${textPrimary} mb-1`}>{alert.message}</p>
                            <p className={`text-[11px] ${textMuted}`}>{alert.ts}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tabla de Leads PREMIUM */}
      <div
        className={`rounded-2xl border ${darkMode ? 'bg-slate-900/50 border-slate-700/50' : 'bg-white border-slate-200'} p-6`}
        style={{
          boxShadow: darkMode
            ? '0 8px 24px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.3)'
            : '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <p className={`text-xs uppercase tracking-wider ${textMuted} mb-1`}>Leads Gestionados por Agentes</p>
            <h3 className={`font-black text-xl ${textPrimary}`} style={{ color: accentColor }}>
              Oportunidades Supervisadas · Próximos 7 días
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {/* Búsqueda */}
            <div className={`relative flex items-center px-3 py-2 rounded-lg border ${borderColor} ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
              <Search className={`w-4 h-4 ${textSecondary} mr-2`} aria-hidden="true" />
              <label htmlFor="lead-search" className="sr-only">Buscar leads</label>
              <input
                id="lead-search"
                type="text"
                placeholder="Buscar leads..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className={`text-sm ${textPrimary} bg-transparent border-0 outline-none w-48`}
                aria-label="Buscar leads por nombre, empresa o estado"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput('')}
                  className={`p-1 rounded ${textSecondary} hover:${textPrimary}`}
                  aria-label="Limpiar búsqueda"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Botón exportar */}
            <button
              onClick={exportToCSV}
              disabled={leads.length === 0}
              className={`px-4 py-2 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-800/50 hover:bg-slate-700/50 disabled:opacity-50' : 'bg-slate-50 hover:bg-slate-100 disabled:opacity-50'} ${textPrimary} text-xs font-semibold transition-all flex items-center gap-2`}
              aria-label="Exportar leads a CSV"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Tabla */}
        {leadsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className={`w-8 h-8 animate-spin ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`} />
            <span className={`ml-3 ${textSecondary}`}>Cargando leads...</span>
          </div>
        ) : leads.length === 0 ? (
          <div className={`text-center py-12 ${textSecondary}`}>
            <p>No se encontraron leads</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full" role="table" aria-label="Tabla de leads priorizados">
              <thead>
                <tr className={`border-b ${borderColor}`}>
                  {(['name', 'company', 'status', 'score', 'owner', 'last'] as SortField[]).map((field) => (
                    <th
                      key={field}
                      className={`pb-3 text-left text-xs font-semibold ${textSecondary} uppercase tracking-wider cursor-pointer hover:${textPrimary} transition-colors`}
                      onClick={() => handleSort(field)}
                      role="columnheader"
                      aria-sort={sortField === field ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}
                    >
                      <div className="flex items-center gap-1">
                        {field === 'name' ? 'Lead' :
                          field === 'company' ? 'Empresa' :
                            field === 'status' ? 'Status' :
                              field === 'score' ? 'Score' :
                                field === 'owner' ? 'Owner' :
                                  'Último contacto'}
                        <ArrowUpDown className={`w-3 h-3 ${sortField === field ? textPrimary : textMuted}`} aria-hidden="true" />
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, index) => (
                  <motion.tr
                    key={lead.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b ${borderColor} hover:${darkMode ? 'bg-slate-800/30' : 'bg-slate-50'} transition-colors`}
                    role="row"
                  >
                    <td className={`py-3 font-semibold text-sm ${textPrimary}`}>{lead.name}</td>
                    <td className={`py-3 text-sm ${textSecondary}`}>{lead.company}</td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${darkMode
                        ? 'bg-slate-700/50 border border-slate-600/50 text-slate-200'
                        : 'bg-slate-100 border border-slate-300 text-slate-700'
                        }`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className={`py-3 font-bold text-sm ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{lead.score}</td>
                    <td className={`py-3 text-sm ${textSecondary}`}>{lead.owner}</td>
                    <td className={`py-3 text-sm ${textMuted}`}>{lead.last}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700/30">
            <div className={`text-sm ${textSecondary}`}>
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} de {totalCount} leads
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLeadsPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg border ${borderColor} ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} ${textPrimary} text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Página anterior"
              >
                Anterior
              </button>
              <span className={`text-sm ${textSecondary} px-2`} aria-label={`Página ${currentPage} de ${totalPages}`}>
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => setLeadsPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg border ${borderColor} ${darkMode ? 'bg-slate-800/50' : 'bg-slate-50'} ${textPrimary} text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label="Página siguiente"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

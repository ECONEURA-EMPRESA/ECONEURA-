/**
 * CRM Executive Dashboard - Premium & Elegant Design
 * 
 * Dashboard ejecutivo con diseño profesional y elegante
 * Alineado con el estilo premium de ECONEURA
 * 
 * @component
 * @version 4.0.0 - Premium Elegant Edition
 */

import React, { useState, useMemo, useCallback, memo, useEffect } from 'react';
import { rgba, hexToRgb } from '../utils/colors';
import { useCRMData, type Period } from '../hooks/useCRMData';
import { useCRMLeads } from '../hooks/useCRMLeads';
import { API_URL } from '../config/api';
import {
  TrendingUp, TrendingDown, DollarSign,
  ArrowUpRight, ArrowDownRight, Award, Trophy,
  BarChart3, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

// ============================================================================
// CONSTANTS
// ============================================================================

const MOCK_AGENTS = [
  { name: 'Embudo Comercial', revenue: 180000, deals: 12, conversion: 8.5, roi: 450, trend: 'up' as const, avatar: '🚀' },
  { name: 'Calidad de Leads', revenue: 120000, deals: 8, conversion: 7.2, roi: 320, trend: 'up' as const, avatar: '🎯' },
  { name: 'Deal Risk IA', revenue: 80000, deals: 5, conversion: 6.8, roi: 280, trend: 'stable' as const, avatar: '⚡' },
  { name: 'Nurturing Automático', revenue: 60000, deals: 4, conversion: 5.5, roi: 220, trend: 'down' as const, avatar: '💬' },
  { name: 'Upsell Predictivo', revenue: 40000, deals: 3, conversion: 4.2, roi: 180, trend: 'up' as const, avatar: '📈' }
];

// ============================================================================
// INTERFACES
// ============================================================================

interface CRMExecutiveDashboardProps {
  departmentName: string;
  accentColor: string;
  darkMode: boolean;
}

interface AgentPerformance {
  name: string;
  revenue: number;
  deals: number;
  conversion: number;
  roi: number;
  trend: 'up' | 'down' | 'stable';
  avatar?: string;
}

interface FunnelStage {
  stage: string;
  value: number;
  color: string;
  isRevenue?: boolean;
}

// ============================================================================
// COMPONENTES AUXILIARES - DISEÑO PREMIUM
// ============================================================================

const HeroMetric = memo(({
  revenue,
  target,
  period,
  darkMode,
  accentColor
}: {
  revenue: number;
  target: number;
  period: string;
  darkMode: boolean;
  accentColor: string;
}) => {
  const percentage = target > 0 ? ((revenue / target) * 100) : 0;
  const isAboveTarget = revenue >= target;
  const diff = revenue - target;
  const diffPercent = target > 0 ? ((diff / target) * 100) : 0;
  const _rgb = hexToRgb(accentColor);

  // Estilo premium elegante
  const bgCard = darkMode
    ? 'bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95'
    : 'bg-gradient-to-br from-white via-slate-50/50 to-white';
  const borderStyle = darkMode
    ? 'border-slate-700/40'
    : 'border-slate-200/80';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-2xl border ${borderStyle} ${bgCard} p-8 mb-8 overflow-hidden`}
      style={{
        boxShadow: darkMode
          ? `0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px ${rgba(accentColor, 0.08)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
          : `0 20px 60px rgba(0, 0, 0, 0.08), 0 0 0 1px ${rgba(accentColor, 0.06)}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
        transform: 'perspective(1000px) translateZ(0)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Efecto de brillo sutil */}
      <div
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 30% 20%, ${rgba(accentColor, 0.15)}, transparent 60%)`
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className={`w-5 h-5 ${textSecondary}`} />
              <p className={`text-sm font-medium uppercase tracking-widest ${textSecondary} letter-spacing-2`}>
                Revenue Total
              </p>
            </div>
            <div className="flex items-baseline gap-4 mb-4">
              <h1
                className="text-7xl font-black leading-none tracking-tight"
                style={{
                  color: accentColor,
                  textShadow: darkMode
                    ? `0 2px 20px ${rgba(accentColor, 0.3)}`
                    : `0 2px 10px ${rgba(accentColor, 0.2)}`
                }}
              >
                €{(revenue / 1000).toFixed(0)}K
              </h1>
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm ${isAboveTarget
                  ? darkMode
                    ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : darkMode
                    ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                    : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
              >
                {isAboveTarget ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span>{diffPercent > 0 ? '+' : ''}{diffPercent.toFixed(1)}%</span>
              </motion.div>
            </div>
          </div>
          <div className="text-right pl-6 border-l border-slate-200/40 dark:border-slate-700/40">
            <p className={`text-xs font-medium uppercase tracking-wider ${textSecondary} mb-2`}>Objetivo</p>
            <p className={`text-3xl font-bold ${textPrimary} mb-1`}>€{(target / 1000).toFixed(0)}K</p>
            <p className={`text-xs ${textSecondary} font-medium`}>{period}</p>
          </div>
        </div>

        {/* Progress bar elegante */}
        <div className={`relative h-2.5 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(percentage, 150)}%` }}
            transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full relative overflow-hidden"
            style={{
              background: isAboveTarget
                ? `linear-gradient(90deg, ${accentColor}, ${rgba(accentColor, 0.8)})`
                : `linear-gradient(90deg, #ef4444, #dc2626)`,
              boxShadow: isAboveTarget
                ? `0 0 20px ${rgba(accentColor, 0.4)}`
                : `0 0 20px rgba(239, 68, 68, 0.3)`
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
});

HeroMetric.displayName = 'HeroMetric';

const TopAgentCard = memo(({
  agent,
  rank,
  darkMode,
  accentColor
}: {
  agent: AgentPerformance;
  rank: number;
  darkMode: boolean;
  accentColor: string;
}) => {
  const _rgb = hexToRgb(accentColor);
  const bgCard = darkMode
    ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80'
    : 'bg-gradient-to-br from-white to-slate-50/50';
  const borderStyle = darkMode
    ? 'border-slate-700/40'
    : 'border-slate-200/80';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';

  const rankConfig = {
    1: {
      badge: '🥇',
      gradient: darkMode ? 'from-amber-500/20 to-amber-600/10' : 'from-amber-50 to-amber-100/50',
      border: darkMode ? 'border-amber-500/30' : 'border-amber-200',
      icon: Trophy,
      iconColor: darkMode ? 'text-amber-400' : 'text-amber-600'
    },
    2: {
      badge: '🥈',
      gradient: darkMode ? 'from-slate-500/20 to-slate-600/10' : 'from-slate-50 to-slate-100/50',
      border: darkMode ? 'border-slate-500/30' : 'border-slate-200',
      icon: Award,
      iconColor: darkMode ? 'text-slate-400' : 'text-slate-600'
    },
    3: {
      badge: '🥉',
      gradient: darkMode ? 'from-orange-500/20 to-orange-600/10' : 'from-orange-50 to-orange-100/50',
      border: darkMode ? 'border-orange-500/30' : 'border-orange-200',
      icon: Award,
      iconColor: darkMode ? 'text-orange-400' : 'text-orange-600'
    }
  };

  const config = rankConfig[rank as keyof typeof rankConfig] || rankConfig[2];
  const RankIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: rank * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ scale: 1.02, y: -4 }}
      className={`relative rounded-xl border ${borderStyle} ${bgCard} p-6 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden group`}
      style={{
        boxShadow: darkMode
          ? `0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px ${rgba(accentColor, 0.05)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
          : `0 10px 40px rgba(0, 0, 0, 0.06), 0 0 0 1px ${rgba(accentColor, 0.04)}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`,
        transform: 'perspective(1000px) translateZ(0)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Efecto de brillo al hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3 flex-1">
            <div
              className={`w-14 h-14 rounded-xl bg-gradient-to-br ${config.gradient} border ${config.border} flex items-center justify-center text-2xl shadow-md group-hover:scale-110 transition-transform duration-300`}
            >
              {agent.avatar || '🤖'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <RankIcon className={`w-4 h-4 ${config.iconColor}`} />
                <h3 className={`font-bold text-base ${textPrimary} truncate`}>{agent.name}</h3>
              </div>
              <p className={`text-xs ${textSecondary} font-medium`}>#{rank} Top Performer</p>
            </div>
          </div>
          {agent.trend === 'up' && (
            <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'} flex-shrink-0`} />
          )}
          {agent.trend === 'down' && (
            <TrendingDown className={`w-5 h-5 ${darkMode ? 'text-rose-400' : 'text-rose-600'} flex-shrink-0`} />
          )}
        </div>

        <div className="space-y-4">
          <div>
            <p className={`text-xs font-medium uppercase tracking-wide ${textSecondary} mb-2`}>Revenue Generado</p>
            <p
              className="text-4xl font-black leading-none"
              style={{
                color: accentColor,
                textShadow: darkMode ? `0 2px 10px ${rgba(accentColor, 0.3)}` : 'none'
              }}
            >
              €{(agent.revenue / 1000).toFixed(0)}K
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-200/40 dark:border-slate-700/40">
            <div>
              <p className={`text-xs ${textSecondary} mb-1.5 font-medium`}>Deals</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{agent.deals}</p>
            </div>
            <div>
              <p className={`text-xs ${textSecondary} mb-1.5 font-medium`}>Conversión</p>
              <p className={`text-2xl font-bold ${textPrimary}`}>{agent.conversion}%</p>
            </div>
          </div>

          <div className={`pt-4 border-t ${darkMode ? 'border-slate-700/40' : 'border-slate-200/40'}`}>
            <p className={`text-xs ${textSecondary} mb-1.5 font-medium`}>ROI</p>
            <p className={`text-xl font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>
              +{agent.roi}%
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

TopAgentCard.displayName = 'TopAgentCard';

const ConversionFunnel = memo(({
  funnel,
  darkMode,
  accentColor
}: {
  funnel: FunnelStage[];
  darkMode: boolean;
  accentColor: string;
}) => {
  const _rgb = hexToRgb(accentColor);
  const bgCard = darkMode
    ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80'
    : 'bg-gradient-to-br from-white to-slate-50/50';
  const borderStyle = darkMode
    ? 'border-slate-700/40'
    : 'border-slate-200/80';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';

  const conversions = funnel.map((stage, index) => {
    if (index === 0) return 100;
    const prevValue = funnel[index - 1].value;
    return prevValue > 0 ? (stage.value / prevValue) * 100 : 0;
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-xl border ${borderStyle} ${bgCard} p-6 shadow-lg overflow-hidden`}
      style={{
        boxShadow: darkMode
          ? `0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px ${rgba(accentColor, 0.05)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
          : `0 10px 40px rgba(0, 0, 0, 0.06), 0 0 0 1px ${rgba(accentColor, 0.04)}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: rgba(accentColor, darkMode ? 0.15 : 0.1)
            }}
          >
            <BarChart3 className={`w-5 h-5`} style={{ color: accentColor }} />
          </div>
          <h3 className={`text-lg font-bold ${textPrimary}`}>Funnel de Conversión</h3>
        </div>

        <div className="space-y-5">
          {funnel.map((stage, index) => {
            const isLast = index === funnel.length - 1;
            const conversion = conversions[index];
            const widthPercent = (stage.value / funnel[0].value) * 100;

            return (
              <motion.div
                key={stage.stage}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.5 }}
                className="relative"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full shadow-sm"
                      style={{
                        backgroundColor: stage.color,
                        boxShadow: `0 0 8px ${rgba(stage.color, 0.5)}`
                      }}
                    />
                    <span className={`font-semibold text-sm ${textPrimary}`}>{stage.stage}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    {!isLast && (
                      <span className={`text-xs font-medium ${textSecondary}`}>
                        {conversion.toFixed(1)}%
                      </span>
                    )}
                    <span className={`text-base font-bold ${textPrimary}`}>
                      {stage.isRevenue
                        ? `€${(stage.value / 1000).toFixed(0)}K`
                        : stage.value.toLocaleString()
                      }
                    </span>
                  </div>
                </div>

                <div className={`relative h-3 rounded-full overflow-hidden ${darkMode ? 'bg-slate-800/60' : 'bg-slate-100'}`}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.8, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="h-full rounded-full relative"
                    style={{
                      backgroundColor: stage.color,
                      boxShadow: `0 0 12px ${rgba(stage.color, 0.4)}`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  </motion.div>
                  {!isLast && (
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <ArrowDownRight className={`w-3 h-3 ${textSecondary} opacity-50`} />
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Resumen elegante */}
        <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-slate-700/40' : 'border-slate-200/40'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${textSecondary}`}>Tasa de Conversión Total</span>
            <span
              className="text-3xl font-black"
              style={{
                color: accentColor,
                textShadow: darkMode ? `0 2px 10px ${rgba(accentColor, 0.3)}` : 'none'
              }}
            >
              {((funnel[funnel.length - 1].value / funnel[0].value) * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});

ConversionFunnel.displayName = 'ConversionFunnel';

const AgentLeaderboard = memo(({
  agents,
  darkMode,
  accentColor
}: {
  agents: AgentPerformance[];
  darkMode: boolean;
  accentColor: string;
}) => {
  const _rgb = hexToRgb(accentColor);
  const bgCard = darkMode
    ? 'bg-gradient-to-br from-slate-800/80 to-slate-900/80'
    : 'bg-gradient-to-br from-white to-slate-50/50';
  const borderStyle = darkMode
    ? 'border-slate-700/40'
    : 'border-slate-200/80';
  const textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';
  const rowBg = darkMode ? 'bg-slate-700/20 hover:bg-slate-700/40' : 'bg-slate-50/50 hover:bg-slate-100/80';
  const rowBorder = darkMode ? 'border-slate-700/30' : 'border-slate-200/60';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative rounded-xl border ${borderStyle} ${bgCard} p-6 shadow-lg overflow-hidden`}
      style={{
        boxShadow: darkMode
          ? `0 10px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px ${rgba(accentColor, 0.05)}, inset 0 1px 0 rgba(255, 255, 255, 0.05)`
          : `0 10px 40px rgba(0, 0, 0, 0.06), 0 0 0 1px ${rgba(accentColor, 0.04)}, inset 0 1px 0 rgba(255, 255, 255, 0.8)`
      }}
    >
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2 rounded-lg"
            style={{
              backgroundColor: rgba(accentColor, darkMode ? 0.15 : 0.1)
            }}
          >
            <Trophy className={`w-5 h-5`} style={{ color: accentColor }} />
          </div>
          <h3 className={`text-lg font-bold ${textPrimary}`}>Leaderboard de Agentes</h3>
        </div>

        <div className="space-y-2">
          {agents.map((agent, index) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04, duration: 0.4 }}
              className={`flex items-center gap-4 p-4 rounded-lg border ${rowBorder} ${rowBg} transition-all duration-200 cursor-pointer group`}
            >
              <div className={`flex items-center justify-center w-12 h-12 rounded-lg text-xl font-bold ${darkMode ? 'bg-slate-700/50' : 'bg-slate-100'
                }`}>
                {agent.avatar || '🤖'}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-xs font-bold ${textSecondary}`}>#{index + 1}</span>
                  <span className={`font-semibold text-sm ${textPrimary} truncate`}>{agent.name}</span>
                  {index < 3 && (
                    <Trophy className={`w-3.5 h-3.5 ${darkMode ? 'text-amber-400' : 'text-amber-600'} flex-shrink-0`} />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
                  <span>{agent.deals} deals</span>
                  <span>•</span>
                  <span>{agent.conversion}% conv.</span>
                  <span>•</span>
                  <span className={darkMode ? 'text-emerald-400' : 'text-emerald-600'}>
                    +{agent.roi}% ROI
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p
                  className="text-xl font-black"
                  style={{
                    color: accentColor,
                    textShadow: darkMode ? `0 1px 8px ${rgba(accentColor, 0.3)}` : 'none'
                  }}
                >
                  €{(agent.revenue / 1000).toFixed(0)}K
                </p>
                <p className={`text-xs ${textSecondary} font-medium mt-0.5`}>Revenue</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
});

AgentLeaderboard.displayName = 'AgentLeaderboard';

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CRMExecutiveDashboard({ departmentName, accentColor, darkMode }: CRMExecutiveDashboardProps) {
  const [period, setPeriod] = useState<Period>('month');

  const departmentId = useMemo(() => {
    const nameLower = departmentName.toLowerCase();
    if (nameLower.includes('marketing') || nameLower.includes('cmo') || nameLower.includes('mkt')) {
      return 'cmo' as const;
    }
    if (nameLower.includes('ventas') || nameLower.includes('cso') || nameLower.includes('cro')) {
      return 'cso' as const;
    }
    return 'cmo' as const;
  }, [departmentName]);

  const { metrics, loading, refresh, lastUpdate } = useCRMData(period, departmentId, true);
  const { leads, totalCount } = useCRMLeads({ department: departmentId, enabled: true, pageSize: 5 });

  const [agentsData, setAgentsData] = useState<AgentPerformance[]>([]);
  const [salesMetrics, setSalesMetrics] = useState<{ total_revenue: number; revenue_by_agent: Array<{ agent_name: string; revenue: number; deals: number }> } | null>(null);

  useEffect(() => {
    const fetchAgentsData = async () => {
      try {
        const token = localStorage.getItem('econeura_token') || '';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json'
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(
          `${API_URL}/crm/sales-metrics?department=${departmentId}&period=${period}`,
          { headers }
        );

        if (response.ok) {
          const data = await response.json();
          const actualData = data?.success && data?.data ? data.data : data;

          setSalesMetrics(actualData);

          if (actualData.revenue_by_agent && Array.isArray(actualData.revenue_by_agent) && actualData.revenue_by_agent.length > 0) {
            const mappedAgents = actualData.revenue_by_agent.map((agent: { agent_name: string; revenue: number; deals: number }, index: number) => {
              const totalLeadsForConversion = totalCount || 1240;
              const conversionRate = totalLeadsForConversion > 0 ? (agent.deals / totalLeadsForConversion) * 100 : 0;
              const roi = agent.revenue > 0 ? Math.round((agent.revenue / 1000) * 2.5) : 0;

              return {
                name: agent.agent_name,
                revenue: agent.revenue,
                deals: agent.deals,
                conversion: Math.round(conversionRate * 10) / 10,
                roi,
                trend: index < 2 ? 'up' as const : index < 4 ? 'stable' as const : 'down' as const,
                avatar: ['🚀', '🎯', '⚡', '💬', '📈', '🤖', '💡', '⭐', '🔥', '🎪'][index] || '🤖'
              };
            });
            setAgentsData(mappedAgents);
          } else {
            setAgentsData(MOCK_AGENTS);
          }
        } else {
          setAgentsData(MOCK_AGENTS);
        }
      } catch (err) {
        // Log error solo en desarrollo (será removido en producción por Vite)
        if (import.meta.env.DEV) {

          console.error('[CRM] Error fetching agents data:', err instanceof Error ? err.message : String(err));
        }
        setAgentsData(MOCK_AGENTS);
      }
    };

    fetchAgentsData();
  }, [departmentId, period, totalCount]);

  const revenue = salesMetrics?.total_revenue || metrics?.totalRevenue || 420000;
  const target = metrics?.revenueTarget || 400000;
  const _dealsWon = metrics?.dealsWon || (salesMetrics?.total_revenue ? Math.round(salesMetrics.total_revenue / 5000) : 87);
  const dealsInProgress = metrics?.dealsInProgress || 161;
  const totalLeads = totalCount || leads.length || 1240;

  const topAgents = useMemo(() => {
    return agentsData.length > 0 ? agentsData.slice(0, 3) : MOCK_AGENTS.slice(0, 3);
  }, [agentsData]);

  const allAgents = useMemo(() => {
    return agentsData.length > 0 ? agentsData.slice(0, 10) : MOCK_AGENTS.slice(0, 10);
  }, [agentsData]);

  const funnel = useMemo(() => {
    return [
      { stage: 'Leads', value: totalLeads, color: '#60a5fa' },
      { stage: 'MQL', value: Math.round(totalLeads * 0.38), color: '#3b82f6' },
      { stage: 'SQL', value: Math.round(totalLeads * 0.21), color: '#2563eb' },
      { stage: 'Deals', value: dealsInProgress, color: '#1d4ed8' },
      { stage: 'Revenue', value: revenue, color: '#10b981', isRevenue: true }
    ];
  }, [totalLeads, dealsInProgress, revenue]);

  const _textPrimary = darkMode ? 'text-white' : 'text-slate-900';
  const textSecondary = darkMode ? 'text-slate-400' : 'text-slate-600';

  const handleRefresh = useCallback(async () => {
    await refresh();
    toast.success('Datos actualizados');
  }, [refresh]);

  return (
    <div className="space-y-8">
      {/* Header elegante */}
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium uppercase tracking-widest ${textSecondary} mb-2`}>
            Executive Dashboard
          </p>
          <h2
            className="text-3xl font-black tracking-tight"
            style={{ color: accentColor }}
          >
            {departmentName}
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value as Period)}
            className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${darkMode
              ? 'bg-slate-800/60 border-slate-700/50 text-white hover:border-slate-600'
              : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400'
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            <option value="week">Semana</option>
            <option value="month">Mes</option>
            <option value="quarter">Trimestre</option>
            <option value="year">Año</option>
          </select>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className={`p-2.5 rounded-lg border transition-all ${darkMode
              ? 'bg-slate-800/60 border-slate-700/50 text-white hover:border-slate-600 hover:bg-slate-700/60'
              : 'bg-white border-slate-300 text-slate-900 hover:border-slate-400 hover:bg-slate-50'
              } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Hero Metric */}
      <HeroMetric
        revenue={revenue}
        target={target}
        period={period}
        darkMode={darkMode}
        accentColor={accentColor}
      />

      {/* Top 3 Agentes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {topAgents.map((agent, index) => (
          <TopAgentCard
            key={agent.name}
            agent={agent}
            rank={index + 1}
            darkMode={darkMode}
            accentColor={accentColor}
          />
        ))}
      </div>

      {/* Funnel y Leaderboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <ConversionFunnel
          funnel={funnel}
          darkMode={darkMode}
          accentColor={accentColor}
        />

        <AgentLeaderboard
          agents={allAgents}
          darkMode={darkMode}
          accentColor={accentColor}
        />
      </div>

      {/* Footer sutil */}
      {lastUpdate && (
        <div className={`text-xs ${textSecondary} text-center font-medium pt-4`}>
          Última actualización: {lastUpdate.toLocaleTimeString('es-ES')}
        </div>
      )}
    </div>
  );
}

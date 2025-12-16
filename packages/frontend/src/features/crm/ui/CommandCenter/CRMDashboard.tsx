import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Maximize2, Minimize2, RefreshCw, Calendar,
    Activity, Zap, Target, Shield, Clock
} from 'lucide-react';
import { toast } from 'sonner';
import { useCRMData, type Period } from '../../../../hooks/useCRMData';
import { useCRMLeads } from '../../../../hooks/useCRMLeads';
import { useDebounce } from '@/utils/debounce';
// import { sanitizeSearchQuery } from '@/utils/sanitize';

// Child Components (To be implemented)
import { KPIHud } from './KPIHud.tsx';
import { RevenueHoloChart } from './RevenueHoloChart.tsx';
import { FunnelHoloChart } from './FunnelHoloChart.tsx';
import { PipelineMonitor } from './PipelineMonitor.tsx';
import { AgentSquadron } from './AgentSquadron.tsx';
import { IntelligenceFeed } from './IntelligenceFeed.tsx';
import { LeadsConsole } from './LeadsConsole.tsx';

interface CRMDashboardProps {
    departmentName: string;
    accentColor: string;
    darkMode?: boolean;
    department?: 'cmo' | 'cso';
}

export const CRMDashboard: React.FC<CRMDashboardProps> = ({
    departmentName,
    accentColor,
    darkMode,
    department
}) => {
    const [period, setPeriod] = useState<Period>('month');
    const [isExpanded, setIsExpanded] = useState(true);
    const [searchInput, setSearchInput] = useState('');

    const sanitizeSearchQuery = (query: string): string => {
        return query.replace(/[^\w\s@.-]/g, '').slice(0, 100);
    };

    // Debounce search
    const debouncedSearch = useDebounce(searchInput, 300);

    // Infer department ID
    const departmentId = useMemo(() => {
        if (department && (department === 'cmo' || department === 'cso')) return department;
        if (departmentName.toLowerCase().includes('marketing') || departmentName.toLowerCase().includes('cmo')) return 'cmo';
        return 'cso';
    }, [department, departmentName]);

    // Data Hooks
    const {
        metrics,
        pipeline,
        agentImpact,
        alerts,
        revenueData,
        loading: dataLoading,
        error: dataError,
        refresh: refreshData,
        lastUpdate
    } = useCRMData(period, departmentId, true);

    const {
        leads,
        loading: leadsLoading,
        error: leadsError,
        totalCount,
        currentPage,
        totalPages,
        refresh: refreshLeads,
        setSearchQuery,
        setSortField,
        setSortDirection,
        setCurrentPage,
        sortField,
        sortDirection
    } = useCRMLeads({ department: departmentId, enabled: true, pageSize: 10 });

    // Sync Search
    useEffect(() => {
        setSearchQuery(sanitizeSearchQuery(debouncedSearch));
    }, [debouncedSearch, setSearchQuery]);

    const handleRefresh = async () => {
        try {
            await Promise.all([refreshData(), refreshLeads()]);
            toast.success('Sistemas actualizados', { description: 'Datos sincronizados con éxito' });
        } catch {
            toast.error('Error de sincronización');
        }
    };

    const loading = dataLoading || leadsLoading;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full relative rounded-3xl overflow-hidden border border-white/10 bg-[#0a0f18]/80 backdrop-blur-xl shadow-[0_0_40px_rgba(0,0,0,0.5)]"
        >
            {/* Cinematic Top Glow */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50" />

            {/* Header HUD */}
            <div className="relative p-6 border-b border-white/5 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-b from-white/5 to-transparent">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <div className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
                            Live Command Center
                        </div>
                        {lastUpdate && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono">
                                <Clock className="w-3 h-3" />
                                <span>SYNC: {lastUpdate.toLocaleTimeString()}</span>
                            </div>
                        )}
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight uppercase font-[Orbitron]" style={{ textShadow: `0 0 20px ${accentColor}40` }}>
                        {departmentName.split('(')[0]} <span className="text-slate-600 font-normal">|</span> <span style={{ color: accentColor }}>Control IA</span>
                    </h2>
                </div>

                <div className="flex items-center gap-3">
                    {/* Period Selector (Glass) */}
                    <div className="relative group">
                        <select
                            value={period}
                            onChange={(e) => setPeriod(e.target.value as Period)}
                            className="appearance-none bg-slate-900/50 border border-white/10 text-white text-xs font-bold uppercase tracking-wider py-2 pl-4 pr-10 rounded-lg focus:outline-none focus:border-emerald-500/50 transition-all cursor-pointer hover:bg-slate-800/50"
                        >
                            <option value="week">Semana</option>
                            <option value="month">Mes</option>
                            <option value="quarter">Trimestre</option>
                            <option value="year">Año</option>
                        </select>
                        <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                    </div>

                    <button
                        onClick={handleRefresh}
                        className={`p-2 rounded-lg border border-white/10 bg-slate-900/50 text-slate-300 hover:text-white hover:bg-white/5 transition-all ${loading ? 'animate-spin text-emerald-400' : ''}`}
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 rounded-lg border border-white/10 bg-slate-900/50 text-slate-300 hover:text-white hover:bg-white/5 transition-all"
                    >
                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="p-6 space-y-6"
                    >
                        {/* 1. HUD Metrics */}
                        <KPIHud metrics={metrics} accentColor={accentColor} loading={loading} />

                        {/* 2. Holo Charts Grid */}
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                            <RevenueHoloChart data={revenueData} accentColor={accentColor} />
                            <FunnelHoloChart pipeline={pipeline} accentColor={accentColor} />
                        </div>

                        {/* 3. Operational Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <PipelineMonitor pipeline={pipeline} accentColor={accentColor} />
                            <AgentSquadron agents={agentImpact} accentColor={accentColor} />
                            <IntelligenceFeed alerts={alerts} />
                        </div>

                        {/* 4. Leads Data Console */}
                        <LeadsConsole
                            leads={leads}
                            loading={loading}
                            totalCount={totalCount}
                            currentPage={currentPage}
                            totalPages={totalPages}
                            searchInput={searchInput}
                            setSearchInput={setSearchInput}
                            setPage={setCurrentPage}
                            sortField={sortField}
                            sortDirection={sortDirection}
                            onSort={(field: string) => {
                                if (sortField === field) {
                                    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
                                } else {
                                    setSortField(field);
                                    setSortDirection('desc');
                                }
                            }}
                            accentColor={accentColor}
                        />

                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

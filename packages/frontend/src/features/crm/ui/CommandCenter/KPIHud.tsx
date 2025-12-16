import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Activity, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface KPIHudProps {
    metrics: any;
    accentColor: string;
    loading: boolean;
}

export const KPIHud: React.FC<KPIHudProps> = ({ metrics, accentColor, loading }) => {
    // Using Mock stats logic adapted from previous component if metrics is null, 
    // but focusing on visual presentation first.

    const stats = [
        {
            label: 'Embudo Comercial',
            value: metrics ? metrics.dealsInProgress + metrics.dealsWon : 1240,
            target: 1200,
            unit: '',
            icon: Zap,
            trend: 'up',
            sparkline: [1050, 1100, 1150, 1200, 1240]
        },
        {
            label: 'Calidad Leads',
            value: metrics ? Math.round((metrics.dealsInProgress + metrics.dealsWon) * 0.72) : 892,
            target: 900,
            unit: '',
            icon: Target,
            trend: 'up',
            sparkline: [850, 870, 880, 890, 892]
        },
        {
            label: 'Pipeline Health',
            value: metrics ? metrics.dealsInProgress : 87,
            target: 100,
            unit: '%',
            icon: Activity,
            trend: 'down',
            sparkline: [95, 92, 90, 88, 87]
        },
        {
            label: 'Revenue IA',
            value: metrics ? (metrics.totalRevenue / 1000).toFixed(0) : '420',
            target: 400,
            unit: 'k €',
            icon: DollarSign,
            trend: 'up',
            sparkline: [380, 395, 410, 405, 420]
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {stats.map((stat, i) => {
                const percent = Math.round((Number(stat.value) / stat.target) * 100);
                const isPositive = percent >= 100;
                const Icon = stat.icon;

                return (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="relative group p-5 rounded-2xl border border-white/5 bg-slate-900/40 hover:bg-slate-800/60 hover:border-white/10 transition-all duration-300"
                    >
                        {/* Glowing Corner Accent */}
                        <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-opacity">
                            <Icon className="w-12 h-12 text-current" style={{ color: accentColor }} />
                        </div>

                        <div className="flex justify-between items-start mb-4 relative z-10">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold mb-1">
                                    {stat.label}
                                </span>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-3xl font-black text-white font-[Orbitron] tracking-tight">
                                        {stat.value}
                                    </span>
                                    <span className="text-sm font-bold text-slate-500">{stat.unit}</span>
                                </div>
                            </div>
                        </div>

                        {/* Sparkline & Status */}
                        <div className="flex items-end justify-between">
                            <div className="h-8 w-24 opacity-60 group-hover:opacity-100 transition-opacity">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={stat.sparkline.map((v, i) => ({ v, i }))}>
                                        <Line
                                            type="monotone"
                                            dataKey="v"
                                            stroke={accentColor}
                                            strokeWidth={2}
                                            dot={false}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex flex-col items-end">
                                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                    {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {percent}%
                                </div>
                                <span className="text-[10px] text-slate-600 mt-1 font-mono">
                                    OBJ: {stat.target}{stat.unit}
                                </span>
                            </div>
                        </div>

                        {/* Bottom Progress Line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800 rounded-b-2xl overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min(percent, 100)}%` }}
                                transition={{ duration: 1.5, delay: 0.5 }}
                                className="h-full"
                                style={{ backgroundColor: accentColor, boxShadow: `0 0 10px ${accentColor}` }}
                            />
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
}

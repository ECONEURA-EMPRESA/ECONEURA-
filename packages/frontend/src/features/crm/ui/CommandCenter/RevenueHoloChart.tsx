import React from 'react';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    BarChart, Bar, Cell
} from 'recharts';
import { Target, TrendingUp } from 'lucide-react';

// ==========================================
// REVENUE HOLO CHART
// ==========================================
export const RevenueHoloChart = ({ data, accentColor }: { data: any[], accentColor: string }) => {
    // Use Mocks if empty
    const chartData = data && data.length > 0 ? data : [
        { month: 'Ene', revenue: 380, target: 400 },
        { month: 'Feb', revenue: 395, target: 400 },
        { month: 'Mar', revenue: 410, target: 400 },
        { month: 'Abr', revenue: 405, target: 400 },
        { month: 'May', revenue: 420, target: 400 }
    ];

    return (
        <div className="relative p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden group">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-[Orbitron]">Revenue Projection</h3>
                    <p className="text-[10px] text-slate-500 font-mono">AI FORECAST MODEL V2.0</p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorRevenueHolo" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={accentColor} stopOpacity={0.5} />
                                <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `€${v}k`} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px' }}
                            itemStyle={{ color: '#fff', fontSize: '12px' }}
                            labelStyle={{ color: '#94a3b8', fontSize: '10px', marginBottom: '5px' }}
                        />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke={accentColor}
                            strokeWidth={3}
                            fillOpacity={1}
                            fill="url(#colorRevenueHolo)"
                        />
                        <Area
                            type="monotone"
                            dataKey="target"
                            stroke="#ef4444"
                            strokeWidth={2}
                            strokeDasharray="4 4"
                            fill="transparent"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

// ==========================================
// FUNNEL HOLO CHART
// ==========================================
export const FunnelHoloChart = ({ pipeline, accentColor }: { pipeline: any[], accentColor: string }) => {
    const funnelData = pipeline && pipeline.length > 0 ? pipeline.map(p => ({
        name: p.stage,
        value: typeof p.value === 'number' ? p.value : 100, // Fallback
        color: p.color
    })) : [
        { name: 'Leads', value: 1200, color: '#60a5fa' },
        { name: 'Qualified', value: 880, color: '#3b82f6' },
        { name: 'Proposal', value: 610, color: '#2563eb' },
        { name: 'Won', value: 420, color: '#1d4ed8' }
    ];

    return (
        <div className="relative p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md overflow-hidden group">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10">
                    <Target className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-[Orbitron]">Conversion Funnel</h3>
                    <p className="text-[10px] text-slate-500 font-mono">REAL-TIME CONVERSION METRICS</p>
                </div>
            </div>

            <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={funnelData} barSize={40}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}`} />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff20', borderRadius: '12px' }}
                        />
                        <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {funnelData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || accentColor} fillOpacity={0.8} stroke={entry.color} strokeWidth={1} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

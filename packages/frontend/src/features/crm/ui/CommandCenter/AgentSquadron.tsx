import React from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, AlertTriangle, Pause, Play, Activity } from 'lucide-react';

export const AgentSquadron = ({ agents, accentColor }: { agents: any[], accentColor: string }) => {
    // Mock data if empty
    const agentList = agents && agents.length > 0 ? agents : [
        { agent: 'Embudo Comercial', impact: '+€180K pipeline', status: 'En producción', icon: Zap },
        { agent: 'Calidad de Leads', impact: '+18% lead score', status: 'En producción', icon: Target },
        { agent: 'Deal Risk IA', impact: '32 deals salvados', status: 'Alertas activas', icon: AlertTriangle }
    ];

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                    <Activity className="w-5 h-5 text-emerald-400" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-[Orbitron]">Active Agents</h3>
            </div>

            <div className="space-y-3">
                {agentList.map((agent, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group flex items-center justify-between p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-all hover:border-emerald-500/30"
                    >
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-1 -right-1 animate-pulse shadow-[0_0_10px_#10b981]" />
                                <div className="p-2 rounded-lg bg-slate-800">
                                    <Zap className="w-4 h-4 text-white" />
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{agent.agent}</p>
                                <p className="text-[10px] text-slate-400">{agent.impact}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                                ACTIVE
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

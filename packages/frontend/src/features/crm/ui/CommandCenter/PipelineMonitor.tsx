import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

export const PipelineMonitor = ({ pipeline, accentColor }: { pipeline: any[], accentColor: string }) => {
    const stages = pipeline && pipeline.length > 0 ? pipeline : [
        { stage: 'Leads', amount: '€1.2M', conversion: '38%', progress: 82, color: '#60a5fa' },
        { stage: 'Qualified', amount: '€880K', conversion: '55%', progress: 72, color: '#3b82f6' },
        { stage: 'Proposal', amount: '€610K', conversion: '62%', progress: 64, color: '#2563eb' },
        { stage: 'Closed Won', amount: '€420K', conversion: '71%', progress: 58, color: '#1d4ed8' }
    ];

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-blue-500/10">
                    <Target className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-[Orbitron]">Pipeline Flow</h3>
            </div>

            <div className="space-y-5">
                {stages.map((stage, i) => (
                    <div key={i} className="space-y-1">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300 font-bold tracking-wide">{stage.stage}</span>
                            <span className="text-white font-mono">{stage.amount}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stage.progress}%` }}
                                transition={{ duration: 1, delay: 0.5 + (i * 0.1) }}
                                className="h-full rounded-full relative"
                                style={{ backgroundColor: stage.color || accentColor }}
                            >
                                <div className="absolute inset-0 bg-white/30 animate-[shimmer_2s_infinite]" />
                            </motion.div>
                        </div>
                        <div className="flex justify-end">
                            <span className="text-[10px] text-slate-500 font-mono">Conv: {stage.conversion}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

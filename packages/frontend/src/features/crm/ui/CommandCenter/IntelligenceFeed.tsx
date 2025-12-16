import React from 'react';
import { motion } from 'framer-motion';
import { Star, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export const IntelligenceFeed = ({ alerts }: { alerts: any[] }) => {
    const items = alerts && alerts.length > 0 ? alerts : [
        { type: 'success', message: 'Campaña Enterprise LATAM supera forecast +24%', ts: '09:20' },
        { type: 'warning', message: 'Deal NovaHR lleva 18 días sin actividad.', ts: '08:05' },
        { type: 'success', message: 'Onboarding automatizado generó 6 upsells', ts: 'Yesterday' }
    ];

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-amber-500/10">
                    <Star className="w-5 h-5 text-amber-400" />
                </div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-[Orbitron]">Intel Feed</h3>
            </div>

            <div className="space-y-3">
                {items.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className={`p-3 rounded-xl border border-l-4 ${item.type === 'success'
                                ? 'border-emerald-500/20 border-l-emerald-500 bg-emerald-500/5'
                                : 'border-amber-500/20 border-l-amber-500 bg-amber-500/5'
                            }`}
                    >
                        <div className="flex gap-3">
                            <div className="mt-0.5">
                                {item.type === 'success' ? (
                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                )}
                            </div>
                            <div>
                                <p className="text-xs font-medium text-slate-200 leading-snug">{item.message}</p>
                                <div className="flex items-center gap-1 mt-1.5 opacity-60">
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] text-slate-400">{item.ts}</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

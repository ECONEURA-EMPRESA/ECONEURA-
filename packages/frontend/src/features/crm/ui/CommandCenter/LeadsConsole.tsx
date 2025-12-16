import React from 'react';
import { motion } from 'framer-motion';
import { Search, Download, Loader2, ArrowUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

interface LeadsConsoleProps {
    leads: any[];
    loading: boolean;
    totalCount: number;
    currentPage: number;
    totalPages: number;
    searchInput: string;
    setSearchInput: (v: string) => void;
    setPage: (p: number) => void;
    sortField: string;
    sortDirection: 'asc' | 'desc';
    onSort: (field: string) => void;
    accentColor: string;
}

export const LeadsConsole: React.FC<LeadsConsoleProps> = ({
    leads, loading, totalCount, currentPage, totalPages,
    searchInput, setSearchInput, setPage, sortField, sortDirection, onSort, accentColor
}) => {

    const handleExport = () => {
        toast.success('Descargando Data Stream cifrado...');
    };

    return (
        <div className="p-6 rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-md">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                    <h3 className="text-lg font-black text-white uppercase tracking-tight font-[Orbitron]">
                        Target Console
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                        {totalCount} ACTIVE TARGETS FOUND
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                            placeholder="SEARCH PROTOCOL..."
                            className="pl-9 pr-4 py-2 bg-slate-800/50 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500/50 w-64 placeholder:text-slate-600 font-mono uppercase"
                        />
                    </div>

                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs font-bold transition-all uppercase tracking-wider"
                    >
                        <Download className="w-4 h-4" />
                        Log Data
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-white/5">
                <table className="w-full text-left">
                    <thead className="bg-slate-900/80 text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">
                        <tr>
                            {['name', 'company', 'status', 'score', 'owner'].map((field) => (
                                <th
                                    key={field}
                                    className="px-6 py-4 cursor-pointer hover:text-white transition-colors"
                                    onClick={() => onSort(field)}
                                >
                                    <div className="flex items-center gap-1">
                                        {field}
                                        <ArrowUpDown className="w-3 h-3 opacity-50" />
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 bg-slate-900/30">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="py-12 text-center text-slate-500">
                                    <div className="flex justify-center items-center gap-2">
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        <span className="font-mono text-xs animate-pulse">Scanning database...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : leads.map((lead, i) => (
                            <motion.tr
                                key={lead.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="group hover:bg-white/5 transition-colors relative"
                            >
                                <td className="px-6 py-4">
                                    <span className="block font-bold text-white text-sm">{lead.name}</span>
                                    <span className="text-[10px] text-slate-500 font-mono">{lead.id}</span>
                                </td>
                                <td className="px-6 py-4 text-sm text-slate-300">{lead.company}</td>
                                <td className="px-6 py-4">
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-white/10">
                                        {lead.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500" style={{ width: `${lead.score}%` }} />
                                        </div>
                                        <span className="font-mono text-xs text-emerald-400">{lead.score}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-400 font-mono">{lead.owner}</td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-xs text-slate-600 font-mono">
                    SECTOR {currentPage} / {totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg bg-slate-800 border border-white/5 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-400" />
                    </button>
                    <button
                        onClick={() => setPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg bg-slate-800 border border-white/5 hover:bg-slate-700 disabled:opacity-50 transition-colors"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                </div>
            </div>
        </div>
    );
};

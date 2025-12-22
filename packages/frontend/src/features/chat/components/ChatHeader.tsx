import React from "react";
import { X, Brain } from "lucide-react";
import { Department, getDeptIcon, getPalette } from "../../../data/neuraData";

interface ChatHeaderProps {
    dept?: Department;
    deptId?: string;
    onClose?: () => void;
}

export function ChatHeader({ dept, deptId, onClose }: ChatHeaderProps) {
    // Get dept from deptId if dept not provided
    const actualDept = dept || (deptId ? { id: deptId, name: '', agents: [], chips: [], neura: { title: '', subtitle: '', tags: [], value: undefined } } as Department : undefined);
    const DeptIconComp = actualDept ? getDeptIcon(actualDept.id) : Brain;
    const pal = actualDept ? getPalette(actualDept.id) : { textHex: '#000', bgHex: '#fff', accentText: '#000' };

    return (
        <div className="sticky top-0 bg-white border-b border-slate-200/40 px-8 py-5 z-20">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100/20 to-transparent opacity-50"></div>
            <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {React.createElement(DeptIconComp, {
                            className: "w-6 h-6 relative z-10",
                            style: { color: pal.textHex }
                        })}
                        <div className="absolute inset-0 bg-gradient-to-br opacity-20 rounded-full" style={{ backgroundColor: pal.textHex }}></div>
                    </div>
                    <div>
                        <div className="text-base font-semibold text-slate-900">{actualDept?.neura.title || 'NEURA'}</div>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-slate-50 border border-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
                                <span className="text-slate-900 font-semibold text-[11px]">Gemini 3 Pro</span>
                            </span>
                            <span className="text-slate-400">·</span>
                            <span className="text-slate-600 text-[10px] font-medium">Google DeepMind</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        title="Cerrar"
                    >
                        <X className="w-5 h-5 text-slate-600" />
                    </button>
                </div>
            </div>
        </div>
    );
}

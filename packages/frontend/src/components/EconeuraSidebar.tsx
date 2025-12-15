import React from 'react';
import { Crown, Cpu, Shield, Workflow, Users, Target, Brain, Wallet, Database, X } from 'lucide-react';
import { DepartmentButton } from './DepartmentButton';
import { getPalette } from '../data/neuraData';

interface Department {
  id: string;
  name: string;
  chips: string[];
  neura: {
    title: string;
    subtitle: string;
    tags: string[];
    value: {
      timeSavedHoursMonth: number;
      valueEurMonth: number;
      roiPercentage: number;
      problem: string;
      solution: string;
    };
  };
  agents: Array<{
    id: string;
    title: string;
    description: string;
    status: 'active' | 'inactive' | 'error';
    lastRun?: string;
  }>;
}

interface EconeuraSidebarProps {
  departments: Department[];
  activeDept: string;
  onDeptChange: (deptId: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const DEPT_ICONS: Record<string, React.ElementType> = {
  CEO: Crown,
  IA: Brain,
  CSO: Shield,
  CTO: Cpu,
  CISO: Shield,
  COO: Workflow,
  CHRO: Users,
  MKT: Target,
  CFO: Wallet,
  CDO: Database
};

export function EconeuraSidebar({
  departments,
  activeDept,
  onDeptChange,
  isOpen,
  onClose
}: EconeuraSidebarProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-slate-200/40 dark:border-gray-700/40 z-50 transform transition-transform duration-300 ease-in-out">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Departamentos NEURA
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <X className="w-5 h-5 text-slate-600 dark:text-gray-300" />
            </button>
          </div>

          <div className="space-y-3">
            {departments.map((dept) => {
              const IconComp = DEPT_ICONS[dept.id] || Crown;
              const isActive = activeDept === dept.id;

              return (
                <DepartmentButton
                  key={dept.id}
                  dept={dept}
                  icon={IconComp as React.ComponentType<any>}
                  palette={getPalette(dept.id)}
                  darkMode={false}
                  isActive={isActive}
                  onClick={() => {
                    onDeptChange(dept.id);
                    onClose();
                  }}
                />
              );
            })}
          </div>
        </div>
      </aside>
    </>
  );
}

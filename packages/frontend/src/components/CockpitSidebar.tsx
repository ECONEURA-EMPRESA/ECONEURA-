/**
 * Componente Sidebar del Cockpit - Extraído para mejor organización
 */
import React, { memo } from 'react';
import { DepartmentButton } from './DepartmentButton';
import { Department } from '../types';
import { getDeptIcon, getPalette } from '../data/neuraData';

interface SidebarProps {
  darkMode: boolean;
  sidebarOpen: boolean;
  activeDept: string;
  setActiveDept: (value: string) => void;
  departments: Department[];
}

export const CockpitSidebar = memo(function CockpitSidebar({
  darkMode,
  sidebarOpen,
  activeDept,
  setActiveDept,
  departments
}: SidebarProps) {
  if (!sidebarOpen) return null;

  return (
    <aside className="w-80 bg-white border-r border-slate-200/60 h-screen overflow-y-auto">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-slate-900 mb-4">Departamentos</h2>
        <div className="space-y-2">
          {departments.map((dept) => (
            <DepartmentButton
              key={dept.id}
              dept={dept}
              isActive={activeDept === dept.id}
              icon={getDeptIcon(dept.id) as React.ComponentType<any>}
              palette={getPalette(dept.id)}
              onClick={() => setActiveDept(dept.id)}
              darkMode={darkMode}
            />
          ))}
        </div>
      </div>
    </aside>
  );
});

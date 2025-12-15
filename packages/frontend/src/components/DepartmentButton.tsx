import React, { memo } from 'react';
import { cx } from '../utils/classnames';
import { rgba, lightenColor } from '../utils/colors';

interface DepartmentButtonProps {
  dept: {
    id: string;
    name: string;
  };
  isActive: boolean;
  icon: React.ComponentType<any>;
  palette: { textHex: string };
  darkMode: boolean;
  onClick: () => void;
}

function DepartmentButtonComponent({ dept, isActive, icon: Icon, palette, darkMode, onClick }: DepartmentButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "group w-full text-left px-5 py-3.5 rounded-xl text-sm flex items-center gap-3.5 transition-[transform,box-shadow,background-color] duration-300 font-medium relative overflow-hidden",
        isActive
          ? "font-bold shadow-xl scale-105 border-l-4"
          : darkMode
            ? "hover:bg-slate-800/50 hover:scale-[1.02]"
            : "hover:bg-slate-50 hover:scale-[1.02] hover:shadow-md"
      )}
      style={isActive ? {
        background: darkMode
          ? `linear-gradient(135deg, ${rgba(palette.textHex, 0.12)}, ${rgba(palette.textHex, 0.06)})`
          : `linear-gradient(135deg, ${rgba(palette.textHex, 0.15)}, ${rgba(palette.textHex, 0.08)})`,
        color: darkMode ? lightenColor(palette.textHex, 20) : palette.textHex,
        borderLeft: `4px solid ${palette.textHex}`,
        boxShadow: `0 10px 25px ${rgba(palette.textHex, darkMode ? 0.25 : 0.15)}`
      } : undefined}
    >
      {/* Shimmer effect when active */}
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 animate-shimmer"></div>
      )}
      <div
        className={cx("p-2 rounded-lg transition-[background-color,box-shadow] duration-300",
          isActive
            ? "shadow-md"
            : darkMode ? "bg-slate-800 group-hover:bg-slate-700" : "bg-slate-100 group-hover:bg-slate-200"
        )}
        style={isActive ? { backgroundColor: rgba(palette.textHex, darkMode ? 0.20 : 0.25) } : undefined}
      >
        {React.createElement(Icon, {
          className: "w-5 h-5 transition-colors",
          style: { color: isActive ? palette.textHex : (darkMode ? '#94a3b8' : '#64748b') }
        })}
      </div>
      <span className={cx("flex-1",
        isActive
          ? "" // Color aplicado via style inline
          : darkMode ? "text-slate-300 group-hover:text-slate-200" : "text-slate-700 group-hover:text-slate-900"
      )}>{dept.name}</span>
      {isActive && (
        <span
          className="text-[10px] px-2.5 py-1 rounded-full font-bold"
          style={{
            backgroundColor: rgba(palette.textHex, darkMode ? 0.20 : 0.15),
            color: darkMode ? lightenColor(palette.textHex, 30) : palette.textHex
          }}
        >
          ✓
        </span>
      )}
    </button>
  );
}

// Optimización: React.memo para evitar re-renders innecesarios
export const DepartmentButton = memo(DepartmentButtonComponent, (prevProps, nextProps) => {
  return (
    prevProps.isActive === nextProps.isActive &&
    prevProps.darkMode === nextProps.darkMode &&
    prevProps.dept.id === nextProps.dept.id
  );
});

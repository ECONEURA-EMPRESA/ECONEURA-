import React, { useState } from 'react';

interface TooltipProps {
    children: React.ReactNode;
    content: string;
    shortcut?: string;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({
    children,
    content,
    shortcut,
    position = 'top'
}: TooltipProps) {
    const [show, setShow] = useState(false);

    const positionClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2'
    };

    const arrowClasses = {
        top: 'top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900',
        bottom: 'bottom-full left-1/2 -translate-x-1/2 border-4 border-transparent border-b-slate-900',
        left: 'left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-slate-900',
        right: 'right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900'
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setShow(true)}
            onMouseLeave={() => setShow(false)}
        >
            {children}
            {show && (
                <div className={`absolute ${positionClasses[position]} px-3 py-2 
                        bg-slate-900 text-white text-sm rounded-lg shadow-xl
                        animate-spring-in z-50 whitespace-nowrap`}>
                    <div className="flex items-center gap-2">
                        <span>{content}</span>
                        {shortcut && (
                            <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-xs font-mono">
                                {shortcut}
                            </kbd>
                        )}
                    </div>
                    <div className={`absolute ${arrowClasses[position]}`} />
                </div>
            )}
        </div>
    );
}

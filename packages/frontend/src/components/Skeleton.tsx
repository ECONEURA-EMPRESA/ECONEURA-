import React from 'react';

interface SkeletonProps {
    className?: string;
    variant?: 'default' | 'text' | 'circular' | 'rectangular';
}

export function Skeleton({
    className = '',
    variant = 'default'
}: SkeletonProps) {
    const baseClasses = 'animate-pulse bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200';

    const variantClasses = {
        default: 'h-4 rounded',
        text: 'h-4 rounded w-full',
        circular: 'rounded-full',
        rectangular: 'rounded-lg'
    };

    return (
        <div
            className={`${baseClasses} ${variantClasses[variant]} ${className} animate-shimmer`}
            style={{
                backgroundSize: '200% 100%'
            }}
        />
    );
}

// Card skeleton for dashboard
export function SkeletonCard() {
    return (
        <div className="p-6 border border-slate-200 rounded-xl space-y-4">
            <Skeleton variant="rectangular" className="h-12 w-12" />
            <Skeleton variant="text" className="w-3/4" />
            <Skeleton variant="text" className="w-1/2" />
            <div className="space-y-2">
                <Skeleton variant="text" />
                <Skeleton variant="text" className="w-5/6" />
            </div>
        </div>
    );
}

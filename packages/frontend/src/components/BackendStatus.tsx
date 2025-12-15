import React, { useEffect, useState } from 'react';
import { Activity, AlertCircle, CheckCircle2 } from 'lucide-react';
import { API_URL } from '../config/api';

type HealthStatus = 'checking' | 'healthy' | 'unhealthy' | 'unknown';

export function BackendStatus() {
    const [status, setStatus] = useState<HealthStatus>('checking');
    const [lastCheck, setLastCheck] = useState<Date | null>(null);

    const checkHealth = async () => {
        try {
            const baseUrl = API_URL.replace('/api', '');
            const response = await fetch(`${baseUrl}/api/health`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
            });

            if (response.ok) {
                setStatus('healthy');
            } else {
                setStatus('unhealthy');
            }
            setLastCheck(new Date());
        } catch (error) {
            setStatus('unhealthy');
            setLastCheck(new Date());
        }
    };

    useEffect(() => {
        checkHealth();
        // Check every 60 seconds
        const interval = setInterval(checkHealth, 60000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = () => {
        switch (status) {
            case 'healthy': return 'text-emerald-400';
            case 'unhealthy': return 'text-red-400';
            case 'checking': return 'text-yellow-400';
            default: return 'text-slate-400';
        }
    };

    const getStatusIcon = () => {
        switch (status) {
            case 'healthy': return <CheckCircle2 className="w-3 h-3" />;
            case 'unhealthy': return <AlertCircle className="w-3 h-3" />;
            case 'checking': return <Activity className="w-3 h-3 animate-pulse" />;
            default: return <Activity className="w-3 h-3" />;
        }
    };

    const getStatusText = () => {
        switch (status) {
            case 'healthy': return 'Backend activo';
            case 'unhealthy': return 'Backend desconectado';
            case 'checking': return 'Verificando...';
            default: return 'Estado desconocido';
        }
    };

    return (
        <div className={`flex items-center gap-2 text-xs ${getStatusColor()}`}>
            {getStatusIcon()}
            <span className="font-medium">{getStatusText()}</span>
            {lastCheck && (
                <span className="text-slate-500 text-[10px]">
                    ({lastCheck.toLocaleTimeString()})
                </span>
            )}
        </div>
    );
}

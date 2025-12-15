import { useState, useEffect } from 'react';
// import { API_URL } from '../config/api';

interface Neura {
    id: string;
    name: string;
    status: 'active' | 'inactive';
    title: string;
    subtitle: string;
    chips: string[];
}

interface Department {
    id: string;
    name: string;
    chips: string[];
    neura: {
        title: string;
        subtitle: string;
        tags: string[];
    };
}

export const useCockpitData = () => {
    const [departments, _setDepartments] = useState<Department[]>([]);
    const [neuras, _setNeuras] = useState<Neura[]>([]);
    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCockpitData = async () => {
            try {
                // Load departments/neuras data
                // En el futuro esto podría venir de una API real
                // Por ahora usamos los datos estáticos que ya existen en el Cockpit

                // Simular carga
                // await new Promise(resolve => setTimeout(resolve, 1000));

                // setDepartments([]);
                // setNeuras([]);
                setLoading(false);
            } catch (err: any) {
                setError(err.message || 'Error loading cockpit data');
                setLoading(false);
            }
        };

        loadCockpitData();
    }, []);

    const reconnect = () => {
        // TODO: WebSocket reconnect logic
        setLoading(true);
        setError(null);
        // Re-fetch data
    };

    return {
        departments,
        neuras,
        isLoading,
        error,
        reconnect,
    };
};

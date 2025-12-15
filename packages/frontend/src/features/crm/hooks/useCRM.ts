import { useState, useEffect } from 'react';
import { CRMService } from '../core/CRMService';
import { Lead, CRMFilters } from '../core/types';

/**
 * The "Iron Interface" Hook.
 * UI components must use this. They cannot access API directly.
 */
export function useCRM(initialFilters?: CRMFilters) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<CRMFilters>(initialFilters || {});

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await CRMService.getLeads(filters);
            setLeads(data);
            setError(null);
        } catch (err) {
            setError('Failed to load CRM data');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const refresh = () => loadData();

    return {
        leads,
        loading,
        error,
        refresh,
        setFilters
    };
}

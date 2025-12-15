/**
 * Hook para gestionar leads del CRM con paginación, búsqueda y filtrado
 * @module useCRMLeads
 */

import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { API_URL } from '../config/api';

/**
 * Interface para un lead del CRM
 */
export interface CRMLead {
  id: string;
  name: string;
  company: string;
  score: number;
  status: string;
  owner: string;
  last: string;
  email?: string;
  phone?: string;
  sector?: string;
  source?: string;
}

interface UseCRMLeadsOptions {
  department?: string;
  enabled?: boolean;
  pageSize?: number;
}

interface UseCRMLeadsReturn {
  leads: CRMLead[];
  loading: boolean;
  error: Error | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  refresh: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  setSortField: (field: keyof CRMLead) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
  setCurrentPage: (page: number) => void;
  searchQuery: string;
  sortField: keyof CRMLead;
  sortDirection: 'asc' | 'desc';
}

/**
 * Valida y sanitiza un lead recibido de la API
 */
function validateLead(data: unknown): CRMLead | null {
  if (!data || typeof data !== 'object') return null;

  const leadData = data as any;
  const id = String(leadData.id || leadData.lead_id || '');
  // Validar que el ID no esté vacío (crítico para keys de React)
  if (!id || id.trim() === '') {
    // Generar ID temporal si no existe
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    // Log warning solo en desarrollo (será removido en producción por Vite)
    if (import.meta.env.DEV) {

      console.warn('[CRM] Lead sin ID, generando temporal:', tempId);
    }
  }

  const validatedId = id && id.trim() !== '' ? id : `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: validatedId,
    name: String(leadData.name || leadData.lead_name || '').trim() || 'Sin nombre',
    company: String(leadData.company || leadData.company_name || '').trim() || 'Sin empresa',
    score: typeof leadData.score === 'number' ? Math.max(0, Math.min(100, leadData.score)) :
      typeof leadData.lead_score === 'number' ? Math.max(0, Math.min(100, leadData.lead_score)) : 0,
    status: String(leadData.status || leadData.lead_status || '').trim() || 'Sin estado',
    owner: String(leadData.owner || leadData.assigned_agent || '').trim() || 'Sin asignar',
    last: String(leadData.last || leadData.last_contact || leadData.updated_at || '').trim() || 'N/A',
    email: leadData.email ? String(leadData.email).trim() : undefined,
    phone: leadData.phone ? String(leadData.phone).trim() : undefined,
    sector: leadData.sector ? String(leadData.sector).trim() : undefined,
    source: leadData.source ? String(leadData.source).trim() : undefined
  };
}

/**
 * Hook para obtener y gestionar leads del CRM
 */
export function useCRMLeads(options: UseCRMLeadsOptions = {}): UseCRMLeadsReturn {
  const { department = 'cmo', enabled = true, pageSize = 10 } = options;

  const [leads, setLeads] = useState<CRMLead[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortField, setSortField] = useState<keyof CRMLead>('score');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const fetchLeads = useCallback(async () => {
    if (!enabled) return;

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('econeura_token') || '';
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Validar que department sea 'cmo' o 'cso' (backend requiere estos valores exactos)
      const validDepartment = (department === 'cmo' || department === 'cso') ? department : 'cmo';

      // Convertir page/pageSize a limit/offset (formato que espera el backend)
      const limit = pageSize;
      const offset = (currentPage - 1) * pageSize;

      const params = new URLSearchParams({
        department: validDepartment,
        limit: String(limit),
        offset: String(offset),
        ...(searchQuery && { search: searchQuery })
        // Nota: sortBy y sortOrder no están implementados en backend aún
      });

      const response = await fetch(`${API_URL}/crm/leads?${params.toString()}`, { headers });

      if (!response.ok) {
        // Si es 400 o 404, usar datos mock (endpoint puede no estar implementado o tener problemas)
        if (response.status === 400 || response.status === 404) {
          // Log warning solo en desarrollo
          if (import.meta.env.DEV) {

            console.warn('[CRM] API no disponible o parámetros inválidos, usando datos mock');
          }
          setLeads([]);
          setTotalCount(0);
          setLoading(false);
          return;
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Backend retorna: { success: true, data: { leads: [], total: 0 } }
      if (data && data.success && data.data) {
        const leadsData = Array.isArray(data.data.leads) ? data.data.leads : [];
        const validatedLeads = leadsData
          .map(validateLead)
          .filter((lead: CRMLead | null): lead is CRMLead => lead !== null && lead.id !== '');

        setLeads(validatedLeads);
        setTotalCount(data.data.total || validatedLeads.length);
      } else if (data && Array.isArray(data)) {
        // Fallback: si la API retorna directamente un array
        const validatedLeads = data
          .map(validateLead)
          .filter((lead: CRMLead | null): lead is CRMLead => lead !== null && lead.id !== '');

        setLeads(validatedLeads);
        setTotalCount(validatedLeads.length);
      } else {
        // Si no hay datos válidos, dejar vacío
        setLeads([]);
        setTotalCount(0);
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Error desconocido al cargar leads');
      setError(error);
      // Log error solo en desarrollo (será removido en producción por Vite)
      if (import.meta.env.DEV) {

        console.error('[CRM] Error fetching leads:', error instanceof Error ? error.message : String(error));
      }

      // Solo mostrar toast si no es un error 404
      if (!(err instanceof Error && err.message.includes('404'))) {
        toast.error('Error al cargar leads. Usando datos de ejemplo.');
      }
    } finally {
      setLoading(false);
    }
  }, [department, enabled, currentPage, pageSize, sortField, sortDirection, searchQuery]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // Resetear página cuando cambia la búsqueda (solo si no es la primera carga)
  useEffect(() => {
    if (searchQuery !== '' && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [searchQuery]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    leads,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    refresh: fetchLeads,
    setSearchQuery,
    setSortField,
    setSortDirection,
    setCurrentPage,
    searchQuery,
    sortField,
    sortDirection
  };
}

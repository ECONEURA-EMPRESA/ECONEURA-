/**
 * ECONEURA - CRM Lead Domain Model
 */

export interface Lead {
  id: string;
  email: string;
  nombre: string;
  empresa?: string;
  telefono?: string;
  cargo?: string;
  score: number; // 1-10
  status: 'new' | 'qualified' | 'contacted' | 'lost';
  department: 'cmo' | 'cso';
  source_channel?: string; // 'linkedin', 'landing_page', 'google_ads', etc.
  source_method: 'ia' | 'traditional';
  assigned_agent?: string;
  enrichment_data: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}


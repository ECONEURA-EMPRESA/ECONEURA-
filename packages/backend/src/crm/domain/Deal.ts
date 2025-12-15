/**
 * ECONEURA - CRM Deal Domain Model
 */

export interface Deal {
  id: string;
  lead_id: string;
  valor_estimado: number;
  revenue?: number; // Solo cuando closed_won
  stage: 'meeting_scheduled' | 'proposal_sent' | 'negotiation' | 'closed_won' | 'closed_lost';
  source_method: 'ia' | 'traditional';
  assigned_agent?: string;
  meeting_date?: Date;
  proposal_sent_at?: Date;
  closed_date?: Date;
  lost_reason?: string;
  created_at: Date;
  updated_at: Date;
}


-- ============================================
-- CRM PREMIUM - Índices Compuestos (Performance)
-- ============================================
-- 
-- Estos índices optimizan las queries más comunes del CRM.
-- CRÍTICO para performance con muchos datos.

-- ============================================
-- ÍNDICES COMPUESTOS PARA DEALS (Panel de Ventas)
-- ============================================

-- Query: WHERE department = 'cso' AND stage = 'closed_won' AND closed_date >= ...
CREATE INDEX IF NOT EXISTS idx_crm_deals_department_stage_date 
  ON crm_deals(department, stage, closed_date) 
  WHERE closed_date IS NOT NULL;

-- Query: WHERE assigned_agent = 'X' AND stage = 'closed_won' AND revenue > 0
CREATE INDEX IF NOT EXISTS idx_crm_deals_agent_stage_revenue 
  ON crm_deals(assigned_agent, stage, revenue) 
  WHERE revenue IS NOT NULL;

-- Query: Revenue por mes (agregaciones)
CREATE INDEX IF NOT EXISTS idx_crm_deals_month_year_revenue 
  ON crm_deals(
    DATE_TRUNC('month', closed_date),
    EXTRACT(YEAR FROM closed_date),
    revenue
  ) 
  WHERE closed_date IS NOT NULL AND revenue IS NOT NULL;

-- ============================================
-- ÍNDICES COMPUESTOS PARA LEADS
-- ============================================

-- Query: WHERE department = 'cmo' AND status = 'qualified' AND created_at >= ...
CREATE INDEX IF NOT EXISTS idx_crm_leads_department_status_created 
  ON crm_leads(department, status, created_at);

-- Query: WHERE department = 'cmo' AND assigned_agent = 'X' AND status = 'qualified'
CREATE INDEX IF NOT EXISTS idx_crm_leads_department_agent_status 
  ON crm_leads(department, assigned_agent, status);

-- Query: Búsqueda por email (ya tiene UNIQUE, pero agregamos índice para búsquedas)
CREATE INDEX IF NOT EXISTS idx_crm_leads_email_lower 
  ON crm_leads(LOWER(email));

-- ============================================
-- ÍNDICES COMPUESTOS PARA CONVERSACIONES
-- ============================================

-- Query: WHERE lead_id = 'X' ORDER BY timestamp DESC
CREATE INDEX IF NOT EXISTS idx_crm_conversations_lead_timestamp 
  ON crm_conversations(lead_id, timestamp DESC);

-- Query: WHERE agent_name = 'X' AND intent = 'positivo' AND timestamp >= ...
CREATE INDEX IF NOT EXISTS idx_crm_conversations_agent_intent_timestamp 
  ON crm_conversations(agent_name, intent, timestamp);

-- ============================================
-- ÍNDICES COMPUESTOS PARA AGENTES
-- ============================================

-- Query: WHERE department = 'cso' AND status = 'active'
CREATE INDEX IF NOT EXISTS idx_crm_agents_department_status 
  ON crm_agents(department, status);

-- ============================================
-- COMENTARIOS
-- ============================================

COMMENT ON INDEX idx_crm_deals_department_stage_date IS 
  'Optimiza queries de panel de ventas por departamento, stage y fecha';

COMMENT ON INDEX idx_crm_deals_agent_stage_revenue IS 
  'Optimiza queries de métricas por agente con revenue';

COMMENT ON INDEX idx_crm_deals_month_year_revenue IS 
  'Optimiza agregaciones de revenue por mes/año';

COMMENT ON INDEX idx_crm_leads_department_status_created IS 
  'Optimiza queries de leads por departamento, status y fecha';

COMMENT ON INDEX idx_crm_leads_department_agent_status IS 
  'Optimiza queries de leads por departamento, agente y status';

COMMENT ON INDEX idx_crm_conversations_lead_timestamp IS 
  'Optimiza queries de conversaciones por lead ordenadas por fecha';

COMMENT ON INDEX idx_crm_conversations_agent_intent_timestamp IS 
  'Optimiza queries de conversaciones por agente e intent';

COMMENT ON INDEX idx_crm_agents_department_status IS 
  'Optimiza queries de agentes por departamento y status';


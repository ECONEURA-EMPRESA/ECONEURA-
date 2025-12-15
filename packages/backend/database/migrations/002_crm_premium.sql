-- ============================================
-- CRM PREMIUM - Marketing y Ventas
-- Migration: 002_crm_premium.sql
-- ============================================

-- Tabla: Leads
CREATE TABLE IF NOT EXISTS crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  nombre VARCHAR(255) NOT NULL,
  empresa VARCHAR(255),
  telefono VARCHAR(50),
  cargo VARCHAR(100),
  score INTEGER CHECK (score >= 1 AND score <= 10) DEFAULT 5,
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'qualified', 'contacted', 'lost')),
  department VARCHAR(50) NOT NULL CHECK (department IN ('cmo', 'cso')),
  source_channel VARCHAR(50),  -- 'linkedin', 'landing_page', 'google_ads', 'cold_email', 'referral'
  source_method VARCHAR(50) DEFAULT 'ia' CHECK (source_method IN ('ia', 'traditional')),
  assigned_agent VARCHAR(255),
  enrichment_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabla: Deals (solo CSO)
CREATE TABLE IF NOT EXISTS crm_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  valor_estimado DECIMAL(10, 2) NOT NULL DEFAULT 0,
  revenue DECIMAL(10, 2),  -- Solo cuando closed_won
  stage VARCHAR(50) DEFAULT 'meeting_scheduled' CHECK (stage IN ('meeting_scheduled', 'proposal_sent', 'negotiation', 'closed_won', 'closed_lost')),
  source_method VARCHAR(50) DEFAULT 'ia' CHECK (source_method IN ('ia', 'traditional')),
  assigned_agent VARCHAR(255),
  meeting_date TIMESTAMP,
  proposal_sent_at TIMESTAMP,
  closed_date TIMESTAMP,
  lost_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  CONSTRAINT ck_revenue_only_closed_won CHECK (
    (stage = 'closed_won' AND revenue IS NOT NULL) OR
    (stage != 'closed_won' AND revenue IS NULL)
  )
);

-- Tabla: Conversaciones
CREATE TABLE IF NOT EXISTS crm_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES crm_leads(id) ON DELETE CASCADE,
  mensaje TEXT NOT NULL,
  agent_name VARCHAR(255) NOT NULL,
  direction VARCHAR(50) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  intent VARCHAR(50) CHECK (intent IN ('positivo', 'neutro', 'negativo')),
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Tabla: Agentes IA
CREATE TABLE IF NOT EXISTS crm_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(255) NOT NULL UNIQUE,
  department VARCHAR(50) NOT NULL CHECK (department IN ('cmo', 'cso')),
  role VARCHAR(50) CHECK (role IN ('prospector', 'qualifier', 'closer', 'nurture', 'retention')),
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused')),
  metrics JSONB DEFAULT '{
    "leads_procesados": 0,
    "meetings_agendados": 0,
    "deals_cerrados": 0,
    "revenue_generado": 0,
    "conversion_rate": 0,
    "avg_deal_value": 0
  }'::jsonb,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- ÍNDICES BÁSICOS (los compuestos están en 003)
-- ============================================

-- Leads
CREATE INDEX IF NOT EXISTS idx_crm_leads_department ON crm_leads(department);
CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON crm_leads(status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON crm_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_crm_leads_assigned_agent ON crm_leads(assigned_agent);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source_method ON crm_leads(source_method);

-- Deals
CREATE INDEX IF NOT EXISTS idx_crm_deals_lead_id ON crm_deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_deals_stage ON crm_deals(stage);
CREATE INDEX IF NOT EXISTS idx_crm_deals_closed_date ON crm_deals(closed_date) WHERE closed_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_revenue ON crm_deals(revenue) WHERE revenue IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_crm_deals_assigned_agent ON crm_deals(assigned_agent);

-- Conversaciones
CREATE INDEX IF NOT EXISTS idx_crm_conversations_lead_id ON crm_conversations(lead_id);
CREATE INDEX IF NOT EXISTS idx_crm_conversations_agent_name ON crm_conversations(agent_name);
CREATE INDEX IF NOT EXISTS idx_crm_conversations_timestamp ON crm_conversations(timestamp);

-- Agentes
CREATE INDEX IF NOT EXISTS idx_crm_agents_department ON crm_agents(department);
CREATE INDEX IF NOT EXISTS idx_crm_agents_status ON crm_agents(status);

-- ============================================
-- TRIGGERS
-- ============================================

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crm_leads_updated_at
  BEFORE UPDATE ON crm_leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_deals_updated_at
  BEFORE UPDATE ON crm_deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_crm_agents_updated_at
  BEFORE UPDATE ON crm_agents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


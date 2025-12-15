import { Crown, Cpu, Shield, Workflow, Users, Target, Brain, LineChart, Wallet, Database } from 'lucide-react';

export type Agent = {
  id: string;
  title: string;
  desc: string;
  pills?: string[];
};

export interface Department {
  id: string;
  name: string;
  chips: string[];
  icon?: any;
  neura: {
    title: string;
    subtitle: string;
    tags: string[];
    value?: {
      timeSavedHoursMonth: number;
      valueEurMonth: number;
      roiPercentage: number;
      problem: string;
      solution: string;
    };
  };
  agents: Agent[];
}

export const DATA: Department[] = [
  { 
    id: 'CEO', 
    name: 'Estrategia (CEO)', 
    chips: ['72h/mes', '5.400 €/mes', 'ROI 5.294%'],
    icon: Crown,
    neura: {
      title: 'NEURA-CEO',
      subtitle: 'Director ejecutivo. Ahorra 72h/mes.',
      tags: ['OKRs en vivo', 'Health score', 'Situación 24/7'],
      value: {
        timeSavedHoursMonth: 72,
        valueEurMonth: 5400,
        roiPercentage: 5294,
        problem: 'CEO gasta 48h/mes recopilando datos de múltiples fuentes. Reuniones eternas sin información actualizada.',
        solution: 'IA agrega datos de 15 fuentes en 1 vista. Alertas inteligentes + reportes automáticos para Board.'
      }
    },
    agents: [
      { id: 'a-ceo-01', title: 'Daily Brief CEO', desc: 'Brief diario ejecutivo. Ahorra 1h/día (€75/día)', pills: ['5h/sem', '€300/sem'] },
      { id: 'a-ceo-02', title: 'OKR Tracker', desc: 'Actualiza OKRs automáticamente. Ahorra 4h/sem (€300/sem)', pills: ['4h/sem', '€1.200/mes'] },
      { id: 'a-ceo-03', title: 'Health Score', desc: 'Score de salud empresa. Ahorra 3h/sem (€225/sem)', pills: ['3h/sem', '€900/mes'] },
      { id: 'a-ceo-04', title: 'Board Pack', desc: 'Prepara pack para Board. Ahorra 6h/mes (€450/mes)', pills: ['6h/mes', '€450/mes'] },
    ]
  },
  // ... (resto de departamentos copiados del archivo original)
  { id:'IA', name:'Inteligencia Artificial', chips:['48h/mes','3.600 €/mes','ROI 3.529%'],
    icon: Brain,
    neura:{
      title:'NEURA-IA',
      subtitle:'Director de IA. Ahorra 48h/mes.',
      tags:['Prompt management','Fine-tuning','Cost tracker'],
      value: {
        timeSavedHoursMonth: 48,
        valueEurMonth: 3600,
        roiPercentage: 3529,
        problem: 'Prompts dispersos, fine-tuning manual (8h/experimento), costes IA sin control (30h/mes auditando).',
        solution: 'IA gestiona librería prompts versionada, automatiza fine-tuning, controla costes real-time.'
      }
    },
    agents:[
      { id:'a-ia-01', title:'Librería Prompts', desc:'Versionado + A/B testing. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-ia-02', title:'Fine-Tuning', desc:'Automatiza experimentos. Ahorra 8h/experimento (€320/exp)', pills:['8h/exp','€1.280/mes'] },
      { id:'a-ia-03', title:'Cost Tracker', desc:'Monitorea spend de APIs. Ahorra 2h/sem (€80/sem)', pills:['2h/sem','€320/mes'] },
      { id:'a-ia-04', title:'Roadmap IA', desc:'Prioriza proyectos IA. Ahorra 4h/mes (€160/mes)', pills:['4h/mes','€160/mes'] },
    ] },
  { id:'CSO', name:'Ventas (CSO/CRO)', chips:['56h/mes','4.200 €/mes','ROI 4.118%'],
    icon: Target,
    neura:{
      title:'NEURA-CSO',
      subtitle:'Director comercial. Ahorra 56h/mes.',
      tags:['Pipeline real-time','Next best action','Forecasting'],
      value: {
        timeSavedHoursMonth: 56,
        valueEurMonth: 4200,
        roiPercentage: 4118,
        problem: 'Actualizar CRM manual (12h/semana), forecast sin datos (6h/semana), deals se pierden sin avisar.',
        solution: 'IA actualiza CRM automáticamente, predice cierre, sugiere acciones para cada deal.'
      }
    },
    agents:[
      { id:'a-cso-01', title:'Pipeline Sync', desc:'Sincroniza CRM automáticamente. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-cso-02', title:'Deal Risk', desc:'Detecta deals en riesgo. Ahorra 2h/sem (€80/sem)', pills:['2h/sem','€320/mes'] },
      { id:'a-cso-03', title:'Forecast Pro', desc:'Forecast con IA. Ahorra 6h/sem (€240/sem)', pills:['6h/sem','€960/mes'] },
      { id:'a-cso-04', title:'Next Action', desc:'Recomienda siguiente acción. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
    ] },
  { id:'CTO', name:'Tecnología (CTO)', chips:['64h/mes','4.800 €/mes','ROI 4.706%'],
    icon: Cpu,
    neura:{
      title:'NEURA-CTO',
      subtitle:'Director tecnológico. Ahorra 64h/mes.',
      tags:['Observability','Incident mgmt','Tech debt'],
      value: {
        timeSavedHoursMonth: 64,
        valueEurMonth: 4800,
        roiPercentage: 4706,
        problem: 'Incidencias reactivas (16h/semana apagando fuegos), tech debt invisible, no hay SLOs automatizados.',
        solution: 'IA detecta anomalías antes de incidencias, prioriza tech debt, monitorea SLOs 24/7.'
      }
    },
    agents:[
      { id:'a-cto-01', title:'Observability', desc:'Monitoreo proactivo. Ahorra 4h/sem (€160/sem)', pills:['4h/sem','€640/mes'] },
      { id:'a-cto-02', title:'Incident Triage', desc:'Prioriza incidencias. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-cto-03', title:'Tech Debt', desc:'Cuantifica deuda técnica. Ahorra 4h/sem (€160/sem)', pills:['4h/sem','€640/mes'] },
      { id:'a-cto-04', title:'Cost Optimizer', desc:'Optimiza infra cloud. Ahorra 5h/sem (€200/sem)', pills:['5h/sem','€800/mes'] },
    ] },
  { id:'CISO', name:'Seguridad (CISO)', chips:['52h/mes','3.900 €/mes','ROI 3.824%'],
    icon: Shield,
    neura:{
      title:'NEURA-CISO',
      subtitle:'Director de seguridad. Ahorra 52h/mes.',
      tags:['Threat intel','Compliance','Phishing'],
      value: {
        timeSavedHoursMonth: 52,
        valueEurMonth: 3900,
        roiPercentage: 3824,
        problem: 'Revisar logs manualmente (12h/semana), compliance audits (16h/trimestre), phishing sin detectar.',
        solution: 'IA analiza logs 24/7, automatiza compliance checks, detecta phishing en tiempo real.'
      }
    },
    agents:[
      { id:'a-ciso-01', title:'Threat Intel', desc:'Correlaciona amenazas. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-ciso-02', title:'Compliance', desc:'Automatiza auditorías. Ahorra 4h/mes (€160/mes)', pills:['16h/trim','€640/trim'] },
      { id:'a-ciso-03', title:'Phishing Shield', desc:'Detecta phishing. Ahorra 2h/sem (€80/sem)', pills:['2h/sem','€320/mes'] },
      { id:'a-ciso-04', title:'Access Review', desc:'Revisa permisos. Ahorra 6h/mes (€240/mes)', pills:['6h/mes','€240/mes'] },
    ] },
  { id:'COO', name:'Operaciones (COO)', chips:['60h/mes','4.500 €/mes','ROI 4.412%'],
    icon: Workflow,
    neura:{
      title:'NEURA-COO',
      subtitle:'Director de operaciones. Ahorra 60h/mes.',
      tags:['Process mining','KPIs ops','Vendor mgmt'],
      value: {
        timeSavedHoursMonth: 60,
        valueEurMonth: 4500,
        roiPercentage: 4412,
        problem: 'Procesos sin documentar (20h/mes mapeando), KPIs en Excel (10h/semana), vendors sin governance.',
        solution: 'IA hace process mining automático, dashboards KPIs real-time, gestiona vendors con alertas.'
      }
    },
    agents:[
      { id:'a-coo-01', title:'Process Mining', desc:'Mapea procesos automáticamente. Ahorra 5h/sem (€200/sem)', pills:['5h/sem','€800/mes'] },
      { id:'a-coo-02', title:'KPI Dashboard', desc:'Dashboards automáticos. Ahorra 2.5h/sem (€100/sem)', pills:['2.5h/sem','€400/mes'] },
      { id:'a-coo-03', title:'Vendor Mgmt', desc:'Gestiona proveedores. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-coo-04', title:'Capacity Plan', desc:'Planificación de capacidad. Ahorra 4h/mes (€160/mes)', pills:['4h/mes','€160/mes'] },
    ] },
  { id:'CHRO', name:'Personas (CHRO)', chips:['44h/mes','3.300 €/mes','ROI 3.235%'],
    icon: Users,
    neura:{
      title:'NEURA-CHRO',
      subtitle:'Director de personas. Ahorra 44h/mes.',
      tags:['Engagement','Turnover risk','Skills map'],
      value: {
        timeSavedHoursMonth: 44,
        valueEurMonth: 3300,
        roiPercentage: 3235,
        problem: 'Encuestas manuales (8h/trimestre), entrevistas de salida reactivas (4h/persona), skills sin mapear.',
        solution: 'IA analiza sentiment continuo, predice riesgo de salida, mapea skills automáticamente.'
      }
    },
    agents:[
      { id:'a-chro-01', title:'Engagement', desc:'Analiza sentiment. Ahorra 2h/sem (€80/sem)', pills:['2h/sem','€320/mes'] },
      { id:'a-chro-02', title:'Turnover Risk', desc:'Predice salidas. Ahorra 1h/sem (€40/sem)', pills:['1h/sem','€160/mes'] },
      { id:'a-chro-03', title:'Skills Map', desc:'Mapea competencias. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-chro-04', title:'Onboarding', desc:'Automatiza onboarding. Ahorra 5h/persona (€200/persona)', pills:['5h/pers','€200/pers'] },
    ] },
  { id:'CMO', name:'Marketing (CMO/CRO)', chips:['64h/mes','3.840 €/mes','ROI 3.778%'],
    icon: LineChart,
    neura:{
      title:'NEURA-CMO/CRO',
      subtitle:'Director comercial. Ahorra 64h/mes.',
      tags:['Embudo comercial','Churn y upsell','Campañas activas'],
      value: {
        timeSavedHoursMonth: 64,
        valueEurMonth: 3840,
        roiPercentage: 3778,
        problem: 'Pipeline manual (3h/semana), lead scoring (5h/semana), reportes (6h/semana)',
        solution: 'IA actualiza pipeline automáticamente, score leads, genera reportes'
      }
    },
    agents:[
      { id:'a-mkt-01', title:'Embudo Comercial', desc:'Actualiza CRM automáticamente. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
      { id:'a-mkt-02', title:'Salud de Pipeline', desc:'Detecta deals en riesgo. Ahorra 2h/sem (€80/sem)', pills:['2h/sem','€320/mes'] },
      { id:'a-mkt-03', title:'Calidad de Leads', desc:'Score automático de leads. Ahorra 4h/sem (€160/sem)', pills:['4h/sem','€640/mes'] },
      { id:'a-mkt-04', title:'Post-Campaña', desc:'Analiza ROI + recomendaciones. Ahorra 3h/sem (€120/sem)', pills:['3h/sem','€480/mes'] },
    ] },
  { id:'CFO', name:'Finanzas (CFO)', chips:['38h/mes','2.850 €/mes','ROI 2.778%'],
    icon: Wallet,
    neura:{
      title:'NEURA-CFO',
      subtitle:'Director financiero. Ahorra 38h/mes.',
      tags:['Cash runway','Variance vs budget','Cobros y pagos'],
      value: {
        timeSavedHoursMonth: 38,
        valueEurMonth: 2850,
        roiPercentage: 2778,
        problem: 'Cierres mensuales (24h/mes), forecasting (8h/mes), variance (4h/mes), board prep (6h/mes)',
        solution: 'IA hace cierre automático, genera forecast, detecta varianzas, crea slides'
      }
    },
    agents:[
      { id:'a-cfo-01', title:'Tesorería', desc:'Ahorra 2h/semana en proyecciones de tesorería' },
      { id:'a-cfo-02', title:'Variance', desc:'Ahorra 1h/semana en análisis de P&L' },
      { id:'a-cfo-03', title:'Facturación', desc:'Ahorra 1.5h/semana en gestión de cobros' },
      { id:'a-cfo-04', title:'Compras', desc:'Ahorra 1h/semana en gestión de contratos' },
    ] },
  { id:'CDO', name:'Datos (CDO)', chips:['28h/mes','2.100 €/mes','ROI 2.020%'],
    icon: Database,
    neura:{
      title:'NEURA-CDO',
      subtitle:'Director de datos. Ahorra 28h/mes.',
      tags:['SLAs datos','Gobierno','Catálogo'],
      value: {
        timeSavedHoursMonth: 28,
        valueEurMonth: 2100,
        roiPercentage: 2020,
        problem: 'Calidad datos manual (4h/semana), catálogo (3h/semana), optimización queries (4h/mes)',
        solution: 'IA monitorea calidad 24/7, mantienes catálogo, optimiza queries automáticamente'
      }
    },
    agents:[
      { id:'a-cdo-01', title:'Linaje', desc:'Ahorra 1h/semana en análisis de impacto de datos' },
      { id:'a-cdo-02', title:'Calidad de Datos', desc:'Ahorra 3h/semana en validación de datos' },
      { id:'a-cdo-03', title:'Catálogo', desc:'Ahorra 2h/semana en actualización de catálogo' },
      { id:'a-cdo-04', title:'Coste DWH', desc:'Ahorra 1h/semana en optimización de costes' },
    ] },
];


import React from 'react';
import {
    Crown, Brain, Target, Cpu, Shield, Workflow, Users, LineChart, Wallet, Database,
    CalendarDays, Megaphone, FileText, Gauge, Activity as ActivityIcon, FileBarChart2,
    MessageCircle, ListChecks, Bug, Radar, Inbox, Mail, TrendingUp, ClipboardList
} from 'lucide-react';

export interface Agent {
    id: string;
    title: string;
    desc: string;
    pills?: string[];
}

export interface Department {
    id: string;
    name: string;
    chips: string[];
    neura: {
        title: string;
        subtitle: string;
        tags: string[];
        value?: {
            timeSavedHoursMonth: number;    // Horas ahorradas/mes
            valueEurMonth: number;           // Valor en EUR/mes
            roiPercentage: number;           // ROI %
            problem: string;                 // Problema que resuelve
            solution: string;                // Solución que ofrece
        };
    };
    agents: Agent[];
}

// Iconos por departamento
export const DeptIcon: Record<string, React.ElementType> = {
    CEO: Crown,
    IA: Brain,
    CSO: Target,
    CTO: Cpu,
    CISO: Shield,
    COO: Workflow,
    CHRO: Users,
    MKT: LineChart,
    CFO: Wallet,
    CDO: Database,
};

export const isComponent = (x: unknown): x is React.ElementType => !!x && (typeof x === 'function' || typeof x === 'object');

export function getDeptIcon(id: string): React.ElementType {
    const Icon = (DeptIcon as Record<string, React.ElementType>)[id];
    return isComponent(Icon) ? Icon : Crown;
}

export const PALETTE: Record<string, { textHex: string; bgHex: string; accentText: string }> = {
    CEO: { textHex: '#5D7177', bgHex: '#F0F4F8', accentText: '#374151' },
    IA: { textHex: '#7C3AED', bgHex: '#F5F3FF', accentText: '#5B21B6' },
    CSO: { textHex: '#059669', bgHex: '#ECFDF5', accentText: '#047857' },
    CTO: { textHex: '#2563EB', bgHex: '#EFF6FF', accentText: '#1D4ED8' },
    CISO: { textHex: '#DC2626', bgHex: '#FEF2F2', accentText: '#B91C1C' },
    COO: { textHex: '#D97706', bgHex: '#FFFBEB', accentText: '#B45309' },
    CHRO: { textHex: '#DB2777', bgHex: '#FDF2F8', accentText: '#BE185D' },
    MKT: { textHex: '#4F46E5', bgHex: '#EEF2FF', accentText: '#4338CA' },
    CFO: { textHex: '#0891B2', bgHex: '#ECFEFF', accentText: '#0E7490' },
    CDO: { textHex: '#9333EA', bgHex: '#FAF5FF', accentText: '#7E22CE' },
    INO: { textHex: '#EA580C', bgHex: '#FFF7ED', accentText: '#C2410C' },
};

export function getPalette(id: string) {
    return PALETTE[id] || PALETTE['CEO'];
}

// Datos exactos: 10 departamentos NEURA + 40 agentes Make
export const NEURA_DATA: Department[] = [
    {
        id: 'CEO', name: 'Ejecutivo (CEO)', chips: ['88h/mes', '4.400 €/mes', 'ROI 4.340%'],
        neura: {
            title: 'NEURA-CEO',
            subtitle: 'Consejero ejecutivo. Ahorra 88h/mes.',
            tags: ['Resumen del día', 'Top riesgos', 'OKR en alerta'],
            value: {
                timeSavedHoursMonth: 88,
                valueEurMonth: 4400,
                roiPercentage: 4340,
                problem: '200+ emails/día (3h), 20 decisiones/día (2h), reuniones interminables',
                solution: 'IA resume emails -> 10 críticos (5min), prioriza decisiones -> top 5 (30min)'
            }
        },
        agents: [
            { id: 'a-ceo-01', title: 'Agenda Consejo', desc: 'Genera agenda + materiales de reunión. Ahorra 2h/sem (€80/sem)', pills: ['2h/sem', '€320/mes'] },
            { id: 'a-ceo-02', title: 'Anuncio Semanal', desc: 'Redacta comunicado de empresa. Ahorra 1h/sem (€40/sem)', pills: ['1h/sem', '€160/mes'] },
            { id: 'a-ceo-03', title: 'Resumen Ejecutivo', desc: 'Compila KPIs + insights. Ahorra 3h/sem (€120/sem)', pills: ['3h/sem', '€480/mes'] },
            { id: 'a-ceo-04', title: 'Seguimiento OKR', desc: 'Dashboard de OKRs en tiempo real. Ahorra 2h/sem (€80/sem)', pills: ['2h/sem', '€320/mes'] },
        ]
    },
    {
        id: 'IA', name: 'Plataforma IA', chips: ['40h/mes', '3.000 €/mes', 'ROI 2.929%'],
        neura: {
            title: 'NEURA-IA',
            subtitle: 'Director de plataforma IA. Ahorra 40h/mes.',
            tags: ['Consumo por modelo', 'Errores por proveedor', 'Fallbacks últimos 7d'],
            value: {
                timeSavedHoursMonth: 40,
                valueEurMonth: 3000,
                roiPercentage: 2929,
                problem: 'Monitoreo manual costes IA (10h/semana), troubleshooting errores (5h/semana)',
                solution: 'IA optimiza costes automáticamente, detecta/resuelve errores'
            }
        },
        agents: [
            { id: 'a-ia-01', title: 'Salud y Failover', desc: 'Ahorra 2h/semana en monitoreo' },
            { id: 'a-ia-02', title: 'Cost Tracker', desc: 'Ahorra 3h/semana en análisis de costes' },
            { id: 'a-ia-03', title: 'Revisión Prompts', desc: 'Ahorra 2h/semana en optimización' },
            { id: 'a-ia-04', title: 'Vigilancia Cuotas', desc: 'Ahorra 1h/semana en control de cuotas' },
        ]
    },
    {
        id: 'CSO', name: 'Estrategia (CSO)', chips: ['32h/mes', '2.400 €/mes', 'ROI 2.323%'],
        neura: {
            title: 'NEURA-CSO',
            subtitle: 'Asesor estratégico. Ahorra 32h/mes.',
            tags: ['Riesgos emergentes', 'Tendencias del sector', 'Oportunidades M&A'],
            value: {
                timeSavedHoursMonth: 32,
                valueEurMonth: 2400,
                roiPercentage: 2323,
                problem: 'Análisis de riesgos manual (4h/semana), vigilancia competencia (4h/semana)',
                solution: 'IA detecta riesgos automáticamente, monitorea competencia 24/7'
            }
        },
        agents: [
            { id: 'a-cso-01', title: 'Gestor de Riesgos', desc: 'Ahorra 4h/semana en análisis de riesgos' },
            { id: 'a-cso-02', title: 'Vigilancia Competitiva', desc: 'Ahorra 2h/semana en monitoreo competitivo' },
            { id: 'a-cso-03', title: 'Radar de Tendencias', desc: 'Ahorra 1h/semana en investigación de tendencias' },
            { id: 'a-cso-04', title: 'M&A Sync', desc: 'Ahorra 1h/semana en oportunidades de M&A' },
        ]
    },
    {
        id: 'CTO', name: 'Tecnología (CTO)', chips: ['94h/mes', '7.050 €/mes', 'ROI 7.020%'],
        neura: {
            title: 'NEURA-CTO',
            subtitle: 'Director tecnológico. Ahorra 94h/mes.',
            tags: ['Incidentes críticos', 'SLO semanales', 'Optimización cloud'],
            value: {
                timeSavedHoursMonth: 94,
                valueEurMonth: 7050,
                roiPercentage: 7020,
                problem: 'Monitoring 24/7 (10h/semana), incidentes (8h/semana), code reviews (6h/semana)',
                solution: 'IA monitorea automáticamente, diagnostica incidentes, revisa código'
            }
        },
        agents: [
            { id: 'a-cto-01', title: 'FinOps Cloud', desc: 'Ahorra 3h/semana optimizando costes de cloud' },
            { id: 'a-cto-02', title: 'Seguridad CI/CD', desc: 'Ahorra 2h/semana en auditorías de seguridad' },
            { id: 'a-cto-03', title: 'Observabilidad SLO', desc: 'Ahorra 4h/semana en monitoreo de SLOs' },
            { id: 'a-cto-04', title: 'Gestión Incidencias', desc: 'Ahorra 3h/semana en análisis de postmortems' },
        ]
    },
    {
        id: 'CISO', name: 'Seguridad (CISO)', chips: ['51h/mes', '3.825 €/mes', 'ROI 3.762%'],
        neura: {
            title: 'NEURA-CISO',
            subtitle: 'Director de seguridad. Ahorra 51h/mes.',
            tags: ['Vulnerabilidades críticas', 'Phishing últimos 7d', 'Recertificaciones'],
            value: {
                timeSavedHoursMonth: 51,
                valueEurMonth: 3825,
                roiPercentage: 3762,
                problem: 'Monitoreo CVEs (10h/semana), phishing triage (5h/semana), compliance (8h/mes)',
                solution: 'IA escanea vulnerabilidades 24/7, clasifica phishing, genera reportes compliance'
            }
        },
        agents: [
            { id: 'a-ciso-01', title: 'Vulnerabilidades', desc: 'Ahorra 4h/semana en escaneo de CVEs' },
            { id: 'a-ciso-02', title: 'Phishing Triage', desc: 'Ahorra 3h/semana en clasificación de phishing' },
            { id: 'a-ciso-03', title: 'Backup/Restore DR', desc: 'Ahorra 1h/semana en verificación de backups' },
            { id: 'a-ciso-04', title: 'Recertificación', desc: 'Ahorra 2h/mes en auditorías de recertificación' },
        ]
    },
    {
        id: 'COO', name: 'Operaciones (COO)', chips: ['112h/mes', '5.600 €/mes', 'ROI 5.555%'],
        neura: {
            title: 'NEURA-COO',
            subtitle: 'Director de operaciones. Ahorra 112h/mes.',
            tags: ['Pedidos atrasados', 'SLA por canal', 'Cuellos de botella'],
            value: {
                timeSavedHoursMonth: 112,
                valueEurMonth: 5600,
                roiPercentage: 5555,
                problem: 'Apagar fuegos (15h/semana), SLA tracking (10h/semana), excepciones (10h/semana)',
                solution: 'IA detecta atrasos antes de SLA breach, monitorea 24/7, resuelve 80% excepciones'
            }
        },
        agents: [
            { id: 'a-coo-01', title: 'Atrasos y Excepciones', desc: 'Ahorra 6h/semana detectando problemas operativos' },
            { id: 'a-coo-02', title: 'Centro NPS/CSAT', desc: 'Ahorra 2h/semana analizando feedback de clientes' },
            { id: 'a-coo-03', title: 'Latido de SLA', desc: 'Ahorra 4h/semana en monitoreo de SLAs' },
            { id: 'a-coo-04', title: 'Torre de Control', desc: 'Ahorra 3h/semana en reportes operativos' },
        ]
    },
    {
        id: 'CHRO', name: 'RRHH (CHRO)', chips: ['34.5h/mes', '2.070 €/mes', 'ROI 2.000%'],
        neura: {
            title: 'NEURA-CHRO',
            subtitle: 'Director de RRHH. Ahorra 34.5h/mes.',
            tags: ['Clima semanal', 'Onboardings', 'Vacantes críticas'],
            value: {
                timeSavedHoursMonth: 34.5,
                valueEurMonth: 2070,
                roiPercentage: 2000,
                problem: 'Onboarding manual (6h/empleado), recruitment (20h/mes), clima laboral (8h/mes)',
                solution: 'IA orquesta onboarding, filtra CVs, analiza clima automáticamente'
            }
        },
        agents: [
            { id: 'a-chro-01', title: 'Encuesta de Pulso', desc: 'Ahorra 2h/semana en análisis del clima laboral' },
            { id: 'a-chro-02', title: 'Offboarding Seguro', desc: 'Ahorra 1.5h/empleado en proceso de offboarding' },
            { id: 'a-chro-03', title: 'Onboarding Orquestado', desc: 'Ahorra 3h/empleado en gestión de onboarding' },
            { id: 'a-chro-04', title: 'Pipeline Contratación', desc: 'Ahorra 4h/semana en filtrado de CVs' },
        ]
    },
    {
        id: 'MKT', name: 'Marketing y Ventas (CMO/CRO)', chips: ['64h/mes', '3.840 €/mes', 'ROI 3.778%'],
        neura: {
            title: 'NEURA-CMO/CRO',
            subtitle: 'Director comercial. Ahorra 64h/mes.',
            tags: ['Embudo comercial', 'Churn y upsell', 'Campañas activas'],
            value: {
                timeSavedHoursMonth: 64,
                valueEurMonth: 3840,
                roiPercentage: 3778,
                problem: 'Pipeline manual (3h/semana), lead scoring (5h/semana), reportes (6h/semana)',
                solution: 'IA actualiza pipeline automáticamente, score leads, genera reportes'
            }
        },
        agents: [
            { id: 'a-mkt-01', title: 'Embudo Comercial', desc: 'Actualiza CRM automáticamente. Ahorra 3h/sem (€120/sem)', pills: ['3h/sem', '€480/mes'] },
            { id: 'a-mkt-02', title: 'Salud de Pipeline', desc: 'Detecta deals en riesgo. Ahorra 2h/sem (€80/sem)', pills: ['2h/sem', '€320/mes'] },
            { id: 'a-mkt-03', title: 'Calidad de Leads', desc: 'Score automático de leads. Ahorra 4h/sem (€160/sem)', pills: ['4h/sem', '€640/mes'] },
            { id: 'a-mkt-04', title: 'Post-Campaña', desc: 'Analiza ROI + recomendaciones. Ahorra 3h/sem (€120/sem)', pills: ['3h/sem', '€480/mes'] },
        ]
    },
    {
        id: 'CFO', name: 'Finanzas (CFO)', chips: ['38h/mes', '2.850 €/mes', 'ROI 2.778%'],
        neura: {
            title: 'NEURA-CFO',
            subtitle: 'Director financiero. Ahorra 38h/mes.',
            tags: ['Cash runway', 'Variance vs budget', 'Cobros y pagos'],
            value: {
                timeSavedHoursMonth: 38,
                valueEurMonth: 2850,
                roiPercentage: 2778,
                problem: 'Cierres mensuales (24h/mes), forecasting (8h/mes), variance (4h/mes), board prep (6h/mes)',
                solution: 'IA hace cierre automático, genera forecast, detecta varianzas, crea slides'
            }
        },
        agents: [
            { id: 'a-cfo-01', title: 'Tesorería', desc: 'Ahorra 2h/semana en proyecciones de tesorería' },
            { id: 'a-cfo-02', title: 'Variance', desc: 'Ahorra 1h/semana en análisis de P&L' },
            { id: 'a-cfo-03', title: 'Facturación', desc: 'Ahorra 1.5h/semana en gestión de cobros' },
            { id: 'a-cfo-04', title: 'Compras', desc: 'Ahorra 1h/semana en gestión de contratos' },
        ]
    },
    {
        id: 'CDO', name: 'Datos (CDO)', chips: ['28h/mes', '2.100 €/mes', 'ROI 2.020%'],
        neura: {
            title: 'NEURA-CDO',
            subtitle: 'Director de datos. Ahorra 28h/mes.',
            tags: ['SLAs datos', 'Gobierno', 'Catálogo'],
            value: {
                timeSavedHoursMonth: 28,
                valueEurMonth: 2100,
                roiPercentage: 2020,
                problem: 'Calidad datos manual (4h/semana), catálogo (3h/semana), optimización queries (4h/mes)',
                solution: 'IA monitorea calidad 24/7, mantienes catálogo, optimiza queries automáticamente'
            }
        },
        agents: [
            { id: 'a-cdo-01', title: 'Linaje', desc: 'Ahorra 1h/semana en análisis de impacto de datos' },
            { id: 'a-cdo-02', title: 'Calidad de Datos', desc: 'Ahorra 3h/semana en validación de datos' },
            { id: 'a-cdo-03', title: 'Catálogo', desc: 'Ahorra 2h/semana en actualización de catálogo' },
            { id: 'a-cdo-04', title: 'Coste DWH', desc: 'Ahorra 1h/semana en optimización de costes' },
        ]
    },
    // AGREGADO NUEVO DEPARTAMENTO/NEURA (INNOVACIÓN)
    {
        id: 'INO', name: 'Innovación (CINO)', chips: ['36h/mes', '2.200 €/mes', 'ROI 2200%'],
        neura: {
            title: 'NEURA-INO',
            subtitle: 'Chief Innovation Officer. Ahorra 36h/mes.',
            tags: ['Patentes', 'Startups', 'Tendencias', 'Prototipos'],
            value: {
                timeSavedHoursMonth: 36,
                valueEurMonth: 2200,
                roiPercentage: 2200,
                problem: 'Décadas para innovar = obsolescencia. Datos dispersos, scouting manual, experimentos lentos.',
                solution: 'IA escanea patentes/papers, radar startups, automatiza PoCs y acelera innovación 10x.'
            }
        },
        agents: [
            { id: 'a-ino-01', title: 'Explorador de Patentes y Papers', desc: 'Escanea bases científicas y de IP. Resume tecnologías emergentes (TRL).', pills: ['TRL', 'Vigilancia'] },
            { id: 'a-ino-02', title: 'Radar de Startups y Ecosistemas', desc: 'Monitorea hubs, fondos, sinergias. Oportunidades de partnership.', pills: ['Open Innovation'] },
            { id: 'a-ino-03', title: 'Generador de Prototipos IA/No-Code', desc: 'Automatiza PoCs y mide "time-to-first-value" para hipótesis.', pills: ['PoC', 'NoCode', 'TTFV'] },
            { id: 'a-ino-04', title: 'Agente de Tendencias de Usuario', desc: 'Analiza foros/feedback para sugerir features antes que la competencia.', pills: ['Tendencias', 'Feedback'] },
            { id: 'a-ino-05', title: 'Orquestador de Innovación Abierta', desc: 'Gestiona retos con universidades/partners. Scoring y priorización.', pills: ['Open', 'Scoring', 'Universidades'] }
        ]
    },
];

export function iconForAgent(title: string): React.ElementType {
    const t = title.toLowerCase();
    let Icon: React.ElementType = ClipboardList;
    if (t.includes('agenda')) Icon = CalendarDays;
    else if (t.includes('anuncio') || t.includes('comunicado')) Icon = Megaphone;
    else if (t.includes('resumen') || t.includes('registro')) Icon = FileText;
    else if (t.includes('okr') || t.includes('score')) Icon = Gauge;
    else if (t.includes('salud') || t.includes('health')) Icon = ActivityIcon;
    else if (t.includes('cost') || t.includes('gasto')) Icon = FileBarChart2;
    else if (t.includes('prompts')) Icon = MessageCircle;
    else if (t.includes('cuotas')) Icon = ListChecks;
    else if (t.includes('incidenc')) Icon = Bug;
    else if (t.includes('observabilidad') || t.includes('slo')) Icon = Radar;
    else if (t.includes('phishing')) Icon = Inbox;
    else if (t.includes('email')) Icon = Mail;
    else if (t.includes('tendencias')) Icon = TrendingUp;
    return isComponent(Icon) ? Icon : ClipboardList;
}

export function TagIcon({ text }: { text: string }) {
    const s = text.toLowerCase();
    const Maybe: React.ElementType = s.includes('riesgo') ? Shield : s.includes('consumo') ? Gauge : s.includes('errores') ? Bug : s.includes('m&a') ? Target : s.includes('tendencias') ? TrendingUp : FileText;
    const I = isComponent(Maybe) ? Maybe : FileText;
    return <I className="w-3 h-3" />;
}

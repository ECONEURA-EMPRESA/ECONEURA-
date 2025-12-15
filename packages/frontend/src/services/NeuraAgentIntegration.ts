// Servicio mejorado de integración NEURA con análisis avanzado
export interface NeuraAnalysis {
  context: string;
  reasoning: string;
  confidence: number;
  shouldExecute: boolean;
  suggestedAgents: string[];
  priority: 'high' | 'medium' | 'low';
}

// Función auxiliar para obtener departamento del agentId
const getDepartmentFromAgentId = (agentId: string): string => {
  // Mapeo de agentId a departamento
  const agentToDept: { [key: string]: string } = {
    'neura-ceo': 'NEURA CEO',
    'neura-cfo': 'NEURA CFO',
    'neura-cmo': 'NEURA CMO',
    'neura-cto': 'NEURA CTO',
    'neura-chro': 'NEURA CHRO',
    'neura-cdo': 'NEURA CDO',
    'neura-coo': 'NEURA COO',
    'neura-cso': 'NEURA CSO',
    'neura-ciso': 'NEURA CISO',
    'neura-ia': 'NEURA IA'
  };

  return agentToDept[agentId] || 'General';
};

// Función para analizar contexto con IA
const analyzeContext = (userInput: string, dept: string): { summary: string; strategic: string; recommendations: string } => {
  const keywords = userInput.toLowerCase();

  // Análisis básico de palabras clave
  const hasNumbers = /\d+/.test(userInput);
  const hasTimeframe = keywords.includes('semana') || keywords.includes('mes') || keywords.includes('año') || keywords.includes('trimestre');
  const hasUrgency = keywords.includes('urgente') || keywords.includes('inmediato') || keywords.includes('crítico');

  let summary = `Análisis de solicitud para ${dept}`;
  let strategic = 'Evaluación estratégica en curso';
  let recommendations = 'Recomendaciones especializadas disponibles';

  if (hasNumbers) {
    summary += ' con métricas específicas';
    strategic += ' considerando datos cuantitativos';
  }

  if (hasTimeframe) {
    summary += ' con marco temporal definido';
    strategic += ' con planificación temporal';
  }

  if (hasUrgency) {
    summary += ' de alta prioridad';
    strategic += ' con enfoque en resultados inmediatos';
    recommendations += ' con acciones prioritarias';
  }

  return { summary, strategic, recommendations };
};

// Función para analizar razonamiento con lógica avanzada
const analyzeReasoning = (userInput: string, dept: string): string => {
  const keywords = userInput.toLowerCase();

  const reasoningTemplates = {
    'NEURA CEO': 'Como CEO, aplico pensamiento estratégico sistémico, considerando impacto organizacional, alineación con objetivos corporativos y maximización del valor para stakeholders.',
    'NEURA CFO': 'Como CFO, aplico rigor financiero y análisis de viabilidad económica, evaluando costos, beneficios, riesgos financieros y retorno de inversión para optimizar recursos.',
    'NEURA CMO': 'Como CMO, analizo el impacto en la experiencia del cliente, posicionamiento de marca y estrategias de marketing para maximizar engagement y conversión.',
    'NEURA CTO': 'Como CTO, evalúo la viabilidad técnica, escalabilidad, seguridad y arquitectura de la solución propuesta, asegurando robustez y mantenibilidad.',
    'NEURA CHRO': 'Como CHRO, considero el impacto en el talento, desarrollo del equipo, cultura organizacional y capacidades humanas necesarias para el éxito.'
  };

  let reasoning = (reasoningTemplates as any)[dept] || 'Aplicando análisis especializado del departamento correspondiente para proporcionar insights relevantes y accionables.';

  // Personalizar razonamiento basado en palabras clave
  if (keywords.includes('análisis') || keywords.includes('evaluar')) {
    reasoning += ' Enfoque en análisis profundo y evaluación sistemática.';
  }

  if (keywords.includes('optimizar') || keywords.includes('mejorar')) {
    reasoning += ' Priorizando optimización y mejora continua.';
  }

  if (keywords.includes('innovación') || keywords.includes('creativo')) {
    reasoning += ' Incorporando pensamiento innovador y soluciones creativas.';
  }

  return reasoning;
};

// Función para obtener contexto especializado por NEURA con análisis mejorado
export const getSpecializedContext = (agentId: string, userInput: string): string => {
  const dept = getDepartmentFromAgentId(agentId);
  const contextAnalysis = analyzeContext(userInput, dept);

  switch (dept) {
    case 'NEURA CEO':
      return `🎯 **Contexto Ejecutivo CEO**: ${contextAnalysis.summary}\n\n**Análisis Estratégico**: ${contextAnalysis.strategic}\n\n**Recomendaciones**: ${contextAnalysis.recommendations}`;

    case 'NEURA CFO':
      return `💰 **Contexto Financiero CFO**: ${contextAnalysis.summary}\n\n**Análisis Económico**: ${contextAnalysis.strategic}\n\n**Impacto Financiero**: ${contextAnalysis.recommendations}`;

    case 'NEURA CMO':
      return `📈 **Contexto Marketing CMO**: ${contextAnalysis.summary}\n\n**Análisis de Mercado**: ${contextAnalysis.strategic}\n\n**Estrategia de Engagement**: ${contextAnalysis.recommendations}`;

    case 'NEURA CTO':
      return `⚙️ **Contexto Técnico CTO**: ${contextAnalysis.summary}\n\n**Análisis de Arquitectura**: ${contextAnalysis.strategic}\n\n**Consideraciones Técnicas**: ${contextAnalysis.recommendations}`;

    case 'NEURA CHRO':
      return `👥 **Contexto Recursos Humanos CHRO**: ${contextAnalysis.summary}\n\n**Análisis de Talento**: ${contextAnalysis.strategic}\n\n**Desarrollo Organizacional**: ${contextAnalysis.recommendations}`;

    default:
      return `🔍 **Contexto General**: ${contextAnalysis.summary}\n\n**Análisis Especializado**: ${contextAnalysis.strategic}\n\n**Recomendaciones**: ${contextAnalysis.recommendations}`;
  }
};

// Función para obtener razonamiento especializado por NEURA con lógica mejorada
export const getSpecializedReasoning = (agentId: string, userInput: string): string => {
  const dept = getDepartmentFromAgentId(agentId);
  return analyzeReasoning(userInput, dept);
};

// Función para determinar si se deben ejecutar agentes con análisis mejorado
export const shouldExecuteAgentsForNeura = (agentId: string, userInput: string): boolean => {
  const keywords = userInput.toLowerCase();
  const dept = getDepartmentFromAgentId(agentId);

  // Palabras clave de acción más específicas por departamento
  const actionKeywords = {
    'NEURA CEO': ['ejecutar', 'implementar', 'estratégico', 'decisión', 'liderazgo', 'objetivo', 'visión'],
    'NEURA CFO': ['calcular', 'presupuesto', 'inversión', 'roi', 'análisis financiero', 'costo', 'beneficio'],
    'NEURA CMO': ['marketing', 'promoción', 'cliente', 'ventas', 'branding', 'campaña', 'engagement'],
    'NEURA CTO': ['desarrollar', 'sistema', 'arquitectura', 'tecnología', 'código', 'implementación', 'optimización'],
    'NEURA CHRO': ['equipo', 'talento', 'capacitación', 'recursos humanos', 'desarrollo', 'personal', 'organización']
  };

  const relevantKeywords = (actionKeywords as any)[dept] || [];
  const hasActionKeywords = relevantKeywords.some((keyword: string) => keywords.includes(keyword));

  // Palabras clave generales de acción
  const generalActionKeywords = ['crear', 'generar', 'procesar', 'analizar', 'optimizar', 'automatizar', 'ejecutar'];
  const hasGeneralAction = generalActionKeywords.some(keyword => keywords.includes(keyword));

  // Indicadores de solicitud de agente
  const agentIndicators = ['agente', 'automatización', 'workflow', 'proceso', 'tarea', 'acción'];
  const hasAgentIndicators = agentIndicators.some(keyword => keywords.includes(keyword));

  return hasActionKeywords || hasGeneralAction || hasAgentIndicators;
};

// Función para calcular confianza de agentes con análisis avanzado
export const calculateAgentConfidence = (agentId: string, userInput: string, context: string): number => {
  const keywords = userInput.toLowerCase();
  const dept = getDepartmentFromAgentId(agentId);

  let confidence = 0.5; // Base confidence

  // Palabras clave específicas por departamento con pesos
  const deptKeywords = {
    'NEURA CEO': { 'estrategia': 0.2, 'visión': 0.2, 'objetivo': 0.15, 'liderazgo': 0.15, 'decisión': 0.15, 'ejecutivo': 0.15 },
    'NEURA CFO': { 'presupuesto': 0.2, 'costo': 0.2, 'inversión': 0.15, 'roi': 0.15, 'financiero': 0.15, 'económico': 0.15 },
    'NEURA CMO': { 'marketing': 0.2, 'cliente': 0.2, 'ventas': 0.15, 'branding': 0.15, 'promoción': 0.15, 'publicidad': 0.15 },
    'NEURA CTO': { 'tecnología': 0.2, 'sistema': 0.2, 'desarrollo': 0.15, 'arquitectura': 0.15, 'código': 0.15, 'software': 0.15 },
    'NEURA CHRO': { 'equipo': 0.2, 'talento': 0.2, 'recursos humanos': 0.15, 'capacitación': 0.15, 'personal': 0.15, 'empleado': 0.15 }
  };

  const relevantKeywords = (deptKeywords as any)[dept] || {};
  let keywordScore = 0;

  Object.entries(relevantKeywords).forEach(([keyword, weight]) => {
    if (keywords.includes(keyword)) {
      keywordScore += (weight as number);
    }
  });

  confidence += keywordScore;

  // Aumentar confianza basado en calidad del contexto
  if (context.length > 100) confidence += 0.1;
  if (context.includes('especializado') || context.includes('análisis')) confidence += 0.05;
  if (context.includes('recomendaciones') || context.includes('estrategia')) confidence += 0.05;

  // Aumentar confianza si hay solicitudes específicas de acción
  const actionKeywords = ['ejecutar', 'implementar', 'crear', 'desarrollar', 'analizar', 'optimizar', 'automatizar'];
  const actionCount = actionKeywords.filter(keyword => keywords.includes(keyword)).length;
  confidence += actionCount * 0.05;

  // Aumentar confianza si hay indicadores de urgencia
  const urgencyKeywords = ['urgente', 'inmediato', 'rápido', 'prioridad', 'crítico'];
  const hasUrgency = urgencyKeywords.some(keyword => keywords.includes(keyword));
  if (hasUrgency) confidence += 0.1;

  return Math.min(Math.max(confidence, 0.1), 0.95); // Mantener entre 0.1 y 0.95
};

// Función para obtener agentes sugeridos basados en el contexto
export const getSuggestedAgents = (agentId: string, userInput: string): string[] => {
  const dept = getDepartmentFromAgentId(agentId);
  const keywords = userInput.toLowerCase();

  // Mapeo de agentes por departamento y contexto
  const agentMapping = {
    'NEURA CEO': {
      'estrategia': ['a-ceo-01', 'a-cfo-01', 'a-cmo-01'],
      'liderazgo': ['a-ceo-01', 'a-chro-01'],
      'decisión': ['a-ceo-01', 'a-cfo-01', 'a-cto-01']
    },
    'NEURA CFO': {
      'presupuesto': ['a-cfo-01', 'a-ceo-01'],
      'inversión': ['a-cfo-01', 'a-cto-01'],
      'análisis': ['a-cfo-01', 'a-cmo-01']
    },
    'NEURA CMO': {
      'marketing': ['a-cmo-01', 'a-ceo-01'],
      'cliente': ['a-cmo-01', 'a-chro-01'],
      'ventas': ['a-cmo-01', 'a-cfo-01']
    },
    'NEURA CTO': {
      'tecnología': ['a-cto-01', 'a-ceo-01'],
      'sistema': ['a-cto-01', 'a-cfo-01'],
      'desarrollo': ['a-cto-01', 'a-chro-01']
    },
    'NEURA CHRO': {
      'equipo': ['a-chro-01', 'a-ceo-01'],
      'talento': ['a-chro-01', 'a-cto-01'],
      'recursos': ['a-chro-01', 'a-cfo-01']
    }
  };

  const deptMapping = (agentMapping as any)[dept] || {};
  const suggestedAgents: string[] = [];

  Object.entries(deptMapping).forEach(([keyword, agents]) => {
    if (keywords.includes(keyword)) {
      suggestedAgents.push(...(agents as string[]));
    }
  });

  // Si no hay agentes específicos, devolver agentes por defecto del departamento
  if (suggestedAgents.length === 0) {
    const defaultAgents = {
      'NEURA CEO': ['a-ceo-01'],
      'NEURA CFO': ['a-cfo-01'],
      'NEURA CMO': ['a-cmo-01'],
      'NEURA CTO': ['a-cto-01'],
      'NEURA CHRO': ['a-chro-01']
    };
    return (defaultAgents as any)[dept] || ['a-ceo-01'];
  }

  return [...new Set(suggestedAgents)]; // Eliminar duplicados
};

// Función principal de análisis NEURA
export const analyzeNeuraRequest = (agentId: string, userInput: string): NeuraAnalysis => {
  const context = getSpecializedContext(agentId, userInput);
  const reasoning = getSpecializedReasoning(agentId, userInput);
  const confidence = calculateAgentConfidence(agentId, userInput, context);
  const shouldExecute = shouldExecuteAgentsForNeura(agentId, userInput);
  const suggestedAgents = getSuggestedAgents(agentId, userInput);

  // Determinar prioridad basada en confianza y palabras clave
  let priority: 'high' | 'medium' | 'low' = 'medium';
  if (confidence > 0.8 || userInput.toLowerCase().includes('urgente')) {
    priority = 'high';
  } else if (confidence < 0.4) {
    priority = 'low';
  }

  return {
    context,
    reasoning,
    confidence,
    shouldExecute,
    suggestedAgents,
    priority
  };
};
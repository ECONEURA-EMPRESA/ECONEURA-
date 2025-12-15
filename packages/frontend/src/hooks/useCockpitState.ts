import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { DATA } from '../data/departments';

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

type NeuraActivity = {
  id: string;
  ts: string;
  agentId: string;
  deptId: string;
  status: 'OK' | 'ERROR';
  message: string;
  executionId?: string;
};

/**
 * Hook que gestiona todo el estado del Cockpit ECONEURA
 * Extrae lógica de estado del componente principal
 */
export function useCockpitState() {
  // Estados principales
  const [activeDept, setActiveDept] = useState(DATA[0].id);
  const [orgView, setOrgView] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activity, setActivity] = useState<NeuraActivity[]>([]);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Estados de chat
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMsgs, setChatMsgs] = useState<{
    id: string;
    text: string;
    role: 'user' | 'assistant';
    model?: string;
    tokens?: number;
    reasoning_tokens?: number;
    cost?: number;
    references?: Array<{ index: number; docId: string; title: string; pages: string; preview: string }>;
    agentExecution?: {
      agentId: string;
      status: 'pending' | 'running' | 'success' | 'error';
      message?: string;
    };
    function_call?: any;
  }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [showAllUsage, setShowAllUsage] = useState(false);
  const [listening, setListening] = useState(false);
  const [pendingAgentExecution, setPendingAgentExecution] = useState<string | null>(null);
  
  // Estados de modales
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectingAgent, setConnectingAgent] = useState<{id: string; title: string} | null>(null);
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);
  const [portalOpen, setPortalOpen] = useState(false);
  const [agentExecutionOpen, setAgentExecutionOpen] = useState(false);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [hitlModalOpen, setHitlModalOpen] = useState(false);
  const [pendingHITL, setPendingHITL] = useState<any>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Estados de features
  const [useInternet, setUseInternet] = useState(false);
  
  // User data
  const [userToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('econeura_token') || '';
    }
    return '';
  });
  
  const [userData, setUserData] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('econeura_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Computados
  const dept = useMemo(() => DATA.find(d => d.id === activeDept) || DATA[0], [activeDept]);
  
  // Búsqueda fuzzy global
  const allAgentsWithDept = useMemo(() => {
    const all: Array<Agent & { deptId: string; deptName: string }> = [];
    DATA.forEach(d => {
      d.agents.forEach((a: Agent) => {
        all.push({ ...a, deptId: d.id, deptName: d.name });
      });
    });
    return all;
  }, []);

  const fuse = useMemo(() => new Fuse(allAgentsWithDept, {
    keys: ['title', 'desc', 'deptName'],
    threshold: 0.4,
    ignoreLocation: true,
    includeScore: true
  }), [allAgentsWithDept]);

  const filteredAgents = useMemo(() => {
    if (!q.trim()) return dept.agents;
    const results = fuse.search(q);
    return results.map(r => r.item);
  }, [fuse, q, dept.agents]);

  return {
    // Estados de navegación
    activeDept,
    setActiveDept,
    dept,
    orgView,
    setOrgView,
    busyId,
    setBusyId,
    
    // Búsqueda
    q,
    setQ,
    filteredAgents,
    allAgentsWithDept,
    
    // Actividad
    activity,
    setActivity,
    
    // UI
    darkMode,
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    settingsOpen,
    setSettingsOpen,
    
    // Chat
    chatOpen,
    setChatOpen,
    chatMsgs,
    setChatMsgs,
    chatInput,
    setChatInput,
    showAllUsage,
    setShowAllUsage,
    listening,
    setListening,
    pendingAgentExecution,
    setPendingAgentExecution,
    
    // Modales
    connectModalOpen,
    setConnectModalOpen,
    connectingAgent,
    setConnectingAgent,
    chatHistoryOpen,
    setChatHistoryOpen,
    portalOpen,
    setPortalOpen,
    agentExecutionOpen,
    setAgentExecutionOpen,
    libraryOpen,
    setLibraryOpen,
    hitlModalOpen,
    setHitlModalOpen,
    pendingHITL,
    setPendingHITL,
    
    // Features
    useInternet,
    setUseInternet,
    
    // User
    userToken,
    userData,
    setUserData
  };
}


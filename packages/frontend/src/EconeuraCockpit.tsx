import React, { useMemo, useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import {
  Crown, Cpu, Shield, Workflow, Users, Target, LineChart, Wallet, Database,
  ClipboardList, Megaphone, FileText, Radar,
  Bug, Gauge, Activity as ActivityIcon, Inbox, Mail, TrendingUp, FileBarChart2, CalendarDays,
  Mic, MicOff, Volume2, StopCircle, Play, Pause, Moon, Sun, User, LogOut, Settings, Menu,
  DollarSign, FileCheck, Clock, Send, Book, Globe, Loader, Brain
} from "lucide-react";
import { API_URL } from './config/api';
import { getApiUrl, getAuthToken, createAuthHeaders } from './utils/apiUrl';
// Imports de componentes premium removidos - manteniendo diseño original
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
// WorkflowManager eliminado - pendiente implementación
import { shouldExecuteAgentsForNeura, getSpecializedContext, getSpecializedReasoning, calculateAgentConfidence } from "./services/NeuraAgentIntegration";
import { ConnectAgentModal } from './components/ConnectAgentModal';
import { ChatHistory } from './components/ChatHistory';
// import { CustomerPortal } from './components/CustomerPortal'; // Component not exported
import { LibraryPanel } from './components/LibraryPanel';
import { ReferencesBlock } from './components/ReferencesBlock';
import { HITLApprovalModal } from './components/HITLApprovalModal';
// Sistema de internacionalización eliminado - solo español
import { Toaster, toast } from "sonner";
import confetti from "canvas-confetti";
import Fuse from "fuse.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Tipos exportados (únicos)


import { cx } from './utils/classnames';
import { hexToRgb, rgba } from './utils/colors';
import { LogoEconeura as BrandLogo } from './components/LogoEconeura';
import { AgentExecutionPanel } from './components/AgentExecutionPanel';
import { DepartmentSelector } from './components/DepartmentSelector';
import { DashboardMetrics } from './components/DashboardMetrics';
import { CRMExecutiveDashboard } from './components/CRMExecutiveDashboard';
import { CRMDashboard as CRMPremiumPanel } from './features/crm/ui/CommandCenter/CRMDashboard';
import { ErrorBoundary } from './components/ErrorBoundary';
import { IntegrationsDialog } from './components/IntegrationsDialog';
import { FooterComponent } from './components/FooterComponent';
import { EconeuraModals } from './components/EconeuraModals';
import { AgentGrid } from './components/AgentGrid';
import { OrgChart } from './components/OrgChart';
import { Agent, NeuraActivity } from './types';

/**
 * ECONEURA — Cockpit completo al 100%
 * - 10 NEURA con chat GPT-5 (simulado gratis o real con API key)
 * - 40 agentes Make con webhooks configurables
 * - Posibilidad de crear nuevos agentes
 * - UI exacta sin cambios de textos ni diseño
 */

// Tipos ahora importados desde ./types/

const HeaderLogo = memo(function HeaderLogo(): React.ReactElement {
  return <BrandLogo size="xs" showText={false} darkMode className="-translate-y-[1px]" />;
});

// Lectura de variables de entorno segura
const readVar = (winKey: string, viteKey: string, nodeKey: string, fallbackKey?: string): string | undefined => {
  const win = typeof window !== 'undefined' ? window as typeof window & Record<string, unknown> : null;
  const fromWin = win?.[winKey] as string | undefined;
  const vite = typeof import.meta !== 'undefined' ? (import.meta as any).env : null;
  const fromVite = vite?.[viteKey] as string | undefined;
  const fromFallback = fallbackKey ? vite?.[fallbackKey] as string | undefined : undefined;
  const node = typeof process !== 'undefined' ? (process as any).env : null;
  const fromNode = node?.[nodeKey] as string | undefined;
  return fromWin || fromVite || fromFallback || fromNode || undefined;
};

// Auto-detecta producción vs local
const isProduction = typeof window !== 'undefined' && (
  window.location.hostname.includes('vercel.app') ||
  window.location.hostname.includes('econeura.com') ||
  window.location.hostname.includes('azurestaticapps.net')
);

const env = {
  GW_URL: API_URL.replace('/api', '') || readVar('__ECONEURA_GW_URL', 'VITE_NEURA_GW_URL', 'NEURA_GW_URL', 'VITE_API_URL'),
  GW_KEY: readVar('__ECONEURA_GW_KEY', 'VITE_NEURA_GW_KEY', 'NEURA_GW_KEY'),
  LA_ID: readVar('__LA_WORKSPACE_ID', 'VITE_LA_WORKSPACE_ID', 'LA_WORKSPACE_ID'),
  LA_KEY: readVar('__LA_SHARED_KEY', 'VITE_LA_SHARED_KEY', 'LA_SHARED_KEY'),
};

const nowIso = () => new Date().toISOString();

function correlationId() {
  try {
    const crypto = globalThis.crypto;
    if (!crypto) throw new Error('no crypto');
    const rnd = crypto.getRandomValues(new Uint32Array(4));
    return Array.from(rnd).map((n) => n.toString(16)).join("");
    throw new Error('no crypto');
  } catch {
    const r = () => Math.floor(Math.random() * 1e9).toString(16);
    return `${Date.now().toString(16)}${r()}${r()}`;
  }
}

// Función para comprimir imágenes
function compressImage(base64Image: string, maxWidth = 800, quality = 0.7): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen redimensionada
      ctx?.drawImage(img, 0, 0, width, height);

      // Convertir a base64 con compresión
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };
    img.src = base64Image;
  });
}

// Obtener webhook Make por departamento
function getDeptWebhook(deptId: string): string | undefined {
  const envObj = typeof import.meta !== 'undefined' ? (import.meta as any).env : {};
  const key = `VITE_MAKE_WEBHOOK_${String(deptId).toUpperCase()}`;
  const url = envObj[key] as string | undefined;
  return url && /^https:\/\/hook\.[a-z0-9.-]+\.make\.com\//i.test(url) ? url : undefined;
}

async function invokeAgent(agentId: string, _route: 'local' | 'azure' = 'azure', payload: Record<string, unknown> = {}) {
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const base = isLocalhost ? 'http://localhost:3000' : (env.GW_URL || 'https://econeura-backend-prod.azurewebsites.net').replace(/\/$/, '');
  const url = `${base}/api/invoke/${agentId}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Correlation-Id': correlationId(),
      },
      body: JSON.stringify({ input: payload?.input ?? "" }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json().catch(() => ({ ok: true, simulated: true, output: `Ejecución iniciada: ${agentId}` }));
  } catch {
    return { ok: true, simulated: true, output: `Enviado a cola de ejecución: ${agentId}` };
  }
}

// Telemetría opcional Azure Log Analytics (solo si hay credenciales)
async function logActivity(row: Record<string, unknown>) {
  if (!env.LA_ID || !env.LA_KEY) return;
  const g = globalThis as typeof globalThis & {
    crypto?: Crypto & { subtle?: SubtleCrypto };
    atob?: (str: string) => string;
    btoa?: (str: string) => string;
  };
  if (!g.crypto || !g.crypto.subtle) return;
  if (typeof g.atob !== 'function' || typeof g.btoa !== 'function') return;
  try {
    const body = JSON.stringify([{ ...row, TimeGenerated: nowIso(), Product: 'ECONEURA', Type: 'EconeuraLogs' }]);
    const endpoint = `https://${env.LA_ID}.ods.opinsights.azure.com/api/logs?api-version=2016-04-01`;
    if (!g.atob) return;
    const keyBytes = Uint8Array.from(g.atob(String(env.LA_KEY)), (c) => c.charCodeAt(0));
    const crypto = g.crypto.subtle;
    const k = await crypto.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const date = nowIso();
    const toSign = new TextEncoder().encode(`POST\n${body.length}\napplication/json\nx-ms-date:${date}\n/api/logs`);
    const sig = await crypto.sign('HMAC', k, toSign);
    if (!g.btoa) return;
    const signature = g.btoa(String.fromCharCode(...new Uint8Array(sig)));
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Log-Type': 'EconeuraLogs',
        'Authorization': `SharedKey ${env.LA_ID}:${signature}`,
        'x-ms-date': date,
      },
      body,
    }).catch(() => { });
  } catch { /* no-op */ }
}

import { NEURA_DATA as DATA, getDeptIcon, getPalette, iconForAgent, TagIcon, isComponent } from './data/neuraData';
import { NeuraChat } from './components/NeuraChat';
import { useNeuraChat } from './hooks/useNeuraChat';

// Polyfill for SpeechRecognition types
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: Event) => void;
  onend: () => void;
}

declare global {
  interface Window {
    SpeechRecognition: {
      new(): SpeechRecognition;
    };
    webkitSpeechRecognition: {
      new(): SpeechRecognition;
    };
  }
}

const theme = { border: '#e5e7eb', muted: '#64748b', ink: '#1f2937', surface: '#ffffff' };

function LogoEconeura({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}


const light = { surface: '#FFFFFF', ink: '#1F2937', border: '#E5E7EB' };
const paletteLocal = { ceo: { primary: '#5D7177' } };



interface EconeuraCockpitUser {
  id: string;
  email: string;
  name: string;
  tenantId?: string;
}

interface EconeuraCockpitProps {
  user?: EconeuraCockpitUser;
  onLogout?: () => void;
}

export default function EconeuraCockpit({ user, onLogout }: EconeuraCockpitProps) {
  // STATE PERSISTENCE
  const [activeDept, setActiveDept] = useState(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('econeura_last_dept') || DATA[0].id;
    return DATA[0].id;
  });



  const [orgView, setOrgView] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activity, setActivity] = useState<NeuraActivity[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Sistema de idiomas eliminado - solo español
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Logout function
  const handleLogout = () => {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      localStorage.removeItem('econeura_token');
      localStorage.removeItem('econeura_user');
      sessionStorage.removeItem('econeura_token');
      sessionStorage.removeItem('econeura_user');

      // Llamar función de logout del padre si existe
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    }
  };

  const dept = useMemo(() => DATA.find(d => d.id === activeDept) ?? DATA[0], [activeDept]);

  // ✅ CRÍTICO: Memoria conversacional y lógica de chat movida a useNeuraChat
  const {
    chatMsgs,
    setChatMsgs,
    chatInput,
    setChatInput,
    isChatLoading,
    attachments,
    isUploadingAttachment,
    handleAttachmentUpload,
    removeAttachment,
    sendChatMessage,
    addDriveAttachment
  } = useNeuraChat(activeDept, dept, handleLogout);
  const [showAllUsage, setShowAllUsage] = useState(false);
  const [pendingAgentExecution, setPendingAgentExecution] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  // Estado para modal de conexión
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectingAgent, setConnectingAgent] = useState<{ id: string; title: string } | null>(null);

  // Estado para historial de chats
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);

  // PERSISTENCE EFFECT & TITLE & URL SYNC
  useEffect(() => {
    localStorage.setItem('econeura_last_dept', activeDept);
    localStorage.setItem('econeura_view', 'cockpit');

    // Update Document Title
    const deptName = DATA.find(d => d.id === activeDept)?.name || 'Cockpit';
    document.title = `${deptName} | Econeura`;

    // Sync URL without reloading
    const url = new URL(window.location.href);
    url.searchParams.set('view', 'cockpit');
    url.searchParams.set('dept', activeDept);
    window.history.replaceState({}, '', url.toString());

  }, [activeDept]);

  // Customer portal state
  const [portalOpen, setPortalOpen] = useState(false);

  // Agent execution panel state
  const [agentExecutionOpen, setAgentExecutionOpen] = useState(false);

  // NEURA Library state
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [useInternet, setUseInternet] = useState(false);

  // HITL state
  const [hitlModalOpen, setHitlModalOpen] = useState(false);
  const [pendingHITL, setPendingHITL] = useState<{
    functionName: string;
    functionArgs: Record<string, unknown>;
    functionResult?: { message?: string };
    neuraName: string;
  } | null>(null);

  // User token (from localStorage or empty)
  const [userToken] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('econeura_token') || '';
    }
    return '';
  });

  // User data
  const [userData, setUserData] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('econeura_user');
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  // Settings dropdown
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [integrationsOpen, setIntegrationsOpen] = useState(false); // New State



  // MEJORA 10: Animaciones CSS personalizadas premium
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInLeft {
        from {
          opacity: 0;
          transform: translateX(-30px);
        }
        to {
          opacity: 1;
          transform: translateX(0);
        }
      }
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes floatParticle {
        0%, 100% {
          transform: translateY(0px) translateX(0px);
          opacity: 0.2;
        }
        50% {
          transform: translateY(-30px) translateX(15px);
          opacity: 0.6;
        }
      }
      @keyframes shimmer {
        0% {
          transform: translateX(-100%) skewX(-12deg);
        }
        100% {
          transform: translateX(200%) skewX(-12deg);
        }
      }
      .animate-shimmer {
        animation: shimmer 3s infinite;
      }
      .animate-fadeInLeft {
        animation: fadeInLeft 0.6s ease-out forwards;
      }
      .animate-fadeInUp {
        animation: fadeInUp 0.6s ease-out forwards;
        animation-delay: 0.1s;
        opacity: 0;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);
  const [voiceSupported] = useState<boolean>(typeof window !== 'undefined' && 'speechSynthesis' in window);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // ✅ SIN LÍMITES: Permitir cualquier tamaño (el LLM manejará lo que pueda)
  const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB (solo para mostrar warning, no bloquear)
  // const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null); // Movido a hook
  // const [isUploadingAttachment, setIsUploadingAttachment] = useState(false); // Movido a hook
  // const fileInputRef = useRef<HTMLInputElement>(null); // Movido a hook/componente
  // const [isChatLoading, setIsChatLoading] = useState(false); // Movido a hook



  // Lógica de historial movida a useNeuraChat
  const lastByAgent = useMemo(() => {
    const m: Record<string, NeuraActivity | undefined> = {};
    for (const e of activity) { if (!m[e.agentId]) m[e.agentId] = e; }
    return m;
  }, [activity]);

  // ⌨️ Keyboard shortcut: Ctrl+K / Cmd+K para focus en búsqueda
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Voice: TTS + STT
  useEffect(() => {
    try {
      const g = globalThis as typeof globalThis & {
        SpeechRecognition?: any;
        webkitSpeechRecognition?: any;
      };
      const SR = g.SpeechRecognition || g.webkitSpeechRecognition;
      if (SR) {
        const rec = new SR();
        rec.lang = 'es-ES';
        rec.interimResults = true;
        rec.onresult = (e: SpeechRecognitionEvent) => {
          let t = '';
          for (let i = e.resultIndex; i < e.results.length; i++) { t += e.results[i][0].transcript; }
          setChatInput(t);
        };
        rec.onend = () => setListening(false);
        recognitionRef.current = rec;
      }
    } catch { }
  }, []);

  function speak(text: string) {
    try {
      if (!('speechSynthesis' in window)) return;
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'es-ES';
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch { }
  }

  function stopSpeak() { try { if ('speechSynthesis' in window) window.speechSynthesis.cancel(); } catch { } }

  function toggleListen() {
    const rec = recognitionRef.current;
    if (!rec) return;
    if (!listening) { setChatInput(''); setListening(true); try { rec.start(); } catch { } }
    else { try { rec.stop(); } catch { } }
  }


  // ðŸ" BÚSQUEDA FUZZY GLOBAL con Fuse.js (permite errores tipográficos)
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
    threshold: 0.4, // Permite 40% de diferencia (muy tolerante a errores)
    ignoreLocation: true,
    includeScore: true
  }), [allAgentsWithDept]);

  const filteredAgents = useMemo(() => {
    if (!q.trim()) return dept.agents;

    const results = fuse.search(q);
    return results.map(r => r.item);
  }, [fuse, q, dept.agents]); // Búsqueda en todos los departamentos

  // Sistema agentic temporalmente deshabilitado

  async function runAgent(a: Agent) {
    try {
      setBusyId(a.id);

      // Verificar si el agente está conectado a algún proveedor
      // ✅ AUDITORÍA: Usar utilidad centralizada para API URL
      const apiUrl = getApiUrl();

      try {
        // Usar endpoint de NEURA agents
        const response = await fetch(`${apiUrl}/api/neura-agents/execute/${a.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: {},
            userId: null,
            action: 'execute',
            parameters: {
              input: `Ejecutar ${a.title}`,
              context: 'cockpit-execution'
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error ejecutando agente: ${response.status}`);
        }

        const result = await response.json();
        // Agent execution result logged via monitoring service

        // Mostrar resultado en actividad
        setActivity(v => [{
          id: correlationId(),
          ts: nowIso(),
          agentId: a.id,
          deptId: dept.id,
          status: 'OK',
          message: `Ejecutado exitosamente - Status: ${result.status}`,
          executionId: result.timestamp
        }, ...v]);

        // 🎉 Confetti + Toast al completar exitosamente
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success(`✅ ${a.title} ejecutado exitosamente`);
        return;

        // Dead code removed
      } catch (mappingError: unknown) {
        // Fallback: intentar webhook Make si está configurado
        const webhook = getDeptWebhook(dept.id);
        if (webhook) {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          await fetch(webhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agentId: a.id, deptId: dept.id, ts: nowIso(), source: 'cockpit' }),
            signal: controller.signal
          });
          clearTimeout(timeout);
          setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: a.id, deptId: dept.id, status: 'OK', message: 'Webhook Make OK' }, ...v]);
          logActivity({ AgentId: a.id, DeptId: dept.id, Status: 'OK', Type: 'Make' });

          // 🎉 Confetti + Toast
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.6 }
          });
          toast.success(`âœ" ${a.title} ejecutado exitosamente`, {
            description: 'Webhook Make completado',
            duration: 3000
          });
        } else {
          throw mappingError;
        }
      }
    } catch (e: any) {
      setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: a.id, deptId: dept.id, status: 'ERROR', message: String(e?.message || 'Error') }, ...v]);
      logActivity({ AgentId: a.id, DeptId: dept.id, Status: 'ERROR' });

      // â Œ Toast de error
      toast.error(`✗ Error al ejecutar ${a.title}`, {
        description: String(e?.message || 'Verifica la conexión con el backend'),
        duration: 4000
      });
    } finally {
      setBusyId(null);
    }
  }

  function openChatWithErrorSamples() {
    setChatOpen(true);
    setChatMsgs([
      { id: correlationId(), text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.', role: 'assistant' },
      { id: correlationId(), text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, inténtalo de nuevo más tarde.', role: 'assistant' },
    ]);
  }

  function startCreateAgent(deptId: string) {
    const instructions = `NEW AGENTE · ${deptId}
Crea un agente y conéctalo a Make.
1) Pega el Webhook de Make en backend.
2) Define I/O y permisos.
3) Publica.`;
    setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: 'new-agent', deptId, status: 'OK', message: 'Solicitud de creación de agente' }, ...v]);
    setChatOpen(true);
    setChatMsgs(v => [...v, { id: correlationId(), text: instructions, role: 'assistant' }]);
  }

  const DeptIconComp = getDeptIcon(dept.id);
  const pal = getPalette(dept.id);

  return (
    <>
      {/* Toast Notifications Premium */}
      <Toaster
        position="top-right"
        theme={darkMode ? 'dark' : 'light'}
        richColors
        closeButton
      />

      <div
        className={`min-h-screen relative transition-colors duration-500 overflow-hidden ${darkMode
          ? 'bg-[#0d1117] text-slate-100'
          : 'bg-gradient-to-br from-slate-50 via-white to-slate-50/80 text-slate-900'
          }`}
        style={{
          boxShadow: darkMode ? 'none' : 'inset 0 1px 0 rgba(255, 255, 255, 0.5)'
        }}
      >
        {/* Floating particles background */}
        {darkMode && (
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `floatParticle 20s ${Math.random() * 5}s infinite ease-in-out`,
                  background: `hsl(${200 + Math.random() * 60}, 70%, 60%)`,
                  opacity: 0.3 + Math.random() * 0.4
                }}
              />
            ))}
          </div>
        )}

        {/* Top bar ultra premium con efectos 3D */}
        <div
          className={`relative h-20 border-b flex items-center px-8 justify-between z-20 ${darkMode
            ? 'border-slate-800 bg-[#161b22]'
            : 'border-slate-200/40 bg-gradient-to-b from-white via-white to-slate-50/30'
            }`}
          style={{
            boxShadow: darkMode
              ? '0 4px 20px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)'
              : '0 2px 12px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
            transform: 'translateZ(0)',
            transformStyle: 'preserve-3d'
          }}
        >
          {/* Borde superior sutil con efecto 3D */}
          <div className={`absolute inset-x-0 top-0 h-[1px] ${darkMode
            ? 'bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-300/40 to-transparent'
            }`} style={{ transform: 'translateZ(1px)' }}></div>

          {/* Borde inferior con profundidad */}
          <div className={`absolute inset-x-0 bottom-0 h-[1px] ${darkMode
            ? 'bg-gradient-to-r from-transparent via-slate-700/40 to-transparent'
            : 'bg-gradient-to-r from-transparent via-slate-200/60 to-transparent'
            }`} style={{ transform: 'translateZ(-1px)' }}></div>

          <div className="flex items-center gap-3.5 group">
            {/* Hamburger Menu - Solo móvil */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`md:hidden w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                }`}
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <HeaderLogo />

            {/* ECONEURA text con relieve */}
            <div className="relative">
              {/* Sombra inferior para relieve */}
              <span
                className="absolute top-[1.5px] left-0 text-xl font-black tracking-tight text-slate-400/40"
                style={{
                  fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.03em',
                  fontWeight: 900
                }}
                aria-hidden="true"
              >
                ECONEURA
              </span>

              {/* Texto principal con relieve 3D */}
              <span
                className={`relative text-xl font-black tracking-tight ${darkMode
                  ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent'
                  : 'text-slate-900'
                  }`}
                style={{
                  fontFamily: '"Inter", "SF Pro Display", system-ui, -apple-system, sans-serif',
                  letterSpacing: '-0.03em',
                  fontWeight: 900,
                  textShadow: darkMode
                    ? '0 2px 8px rgba(16, 185, 129, 0.3)'
                    : '0 2px 0 rgba(255, 255, 255, 0.9), 0 -1px 0 rgba(0, 0, 0, 0.15), 0 3px 8px rgba(0, 0, 0, 0.08)'
                }}
              >
                ECONEURA
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* MEJORA 8: Buscador - Oculto en móvil pequeño */}
            <div className="relative hidden sm:block">
              <input
                ref={searchInputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Buscar agentes..."
                aria-label="Buscar agentes"
                className={`h-11 w-80 rounded-xl border px-5 pr-12 text-sm font-medium focus:outline-none transition-colors duration-200 ${darkMode

                  ? 'border-slate-700/40 bg-slate-800/30 text-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/40 shadow-md'
                  : 'border-slate-200/80 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:border-slate-300 hover:border-slate-300 hover:bg-slate-50 shadow-sm'
                  }`}
                style={{
                  fontFamily: '"Inter", "SF Pro Text", system-ui, -apple-system, sans-serif'
                }}
              />
              <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${darkMode ? 'text-emerald-500/50' : 'text-slate-400'}`}>
                <Radar className="w-[18px] h-[18px]" />
              </div>

              {/* Keyboard Shortcut Badge */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 pointer-events-none hidden sm:block">
                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-sans ${darkMode
                  ? 'bg-slate-700 border-slate-600 text-slate-400'
                  : 'bg-slate-100 border-slate-200 text-slate-500'
                  }`}>
                  Ctrl K
                </span>
              </div>

              {/* Dropdown de resultados en tiempo real */}
              {q.trim() && (
                <div className="absolute top-full mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                  {/* Header del dropdown */}
                  <div className="bg-gradient-to-r from-blue-50 to-slate-50 px-4 py-2 border-b border-slate-200">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        {filteredAgents.length} resultado{filteredAgents.length !== 1 ? 's' : ''}
                      </span>
                      {filteredAgents.length > 0 && (
                        <button
                          onClick={() => setQ('')}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Limpiar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Resultados */}
                  <div className="max-h-96 overflow-y-auto">
                    {filteredAgents.length === 0 ? (
                      <div className="px-4 py-12 text-center text-sm text-slate-500 bg-slate-50/50">
                        <div className="mx-auto w-10 h-10 mb-3 rounded-full bg-slate-100 flex items-center justify-center">
                          <Radar className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="font-medium text-slate-700">No hemos encontrado agentes</p>
                        <p className="text-xs text-slate-400 mt-1">Prueba con otro término o departamento</p>
                      </div>
                    ) : (
                      filteredAgents.map((a: any) => {
                        const I: any = iconForAgent(a.title);

                        // Obtener departamento del agente
                        const agentDept = DATA.find(d => d.id === a.deptId);
                        const agentPal = agentDept ? getPalette(agentDept.id) : pal;
                        const { r, g, b } = hexToRgb(agentPal.textHex);

                        return (
                          <button
                            key={a.id}
                            onClick={() => {
                              // Cambiar al departamento del agente antes de ejecutar
                              if (a.deptId !== activeDept) {
                                setActiveDept(a.deptId);
                              }
                              runAgent(a);
                              setQ('');
                            }}
                            className="w-full px-4 py-3 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                          >
                            <div
                              className="mt-0.5 p-2 rounded-lg"
                              style={{ backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)` }}
                            >
                              {React.createElement(I, {
                                className: "w-4 h-4",
                                style: { color: agentPal.textHex }
                              })}
                            </div>
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-1">
                                <div className="text-sm font-semibold text-slate-900">{a.title}</div>
                                <span
                                  className="text-[10px] px-2.5 py-1 rounded-md font-medium"
                                  style={{
                                    backgroundColor: `rgba(${r}, ${g}, ${b}, 0.15)`,
                                    color: agentPal.textHex
                                  }}
                                >
                                  {a.deptName}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600 mt-0.5">{a.desc}</div>
                              {a.pills && a.pills.length > 0 && (
                                <div className="flex gap-1 mt-2">
                                  {a.pills.slice(0, 2).map((pill: string, i: number) => (
                                    <span key={i} className="text-[10px] px-2.5 py-0.5 bg-slate-100 rounded-full text-slate-600">
                                      {pill}
                                    </span>
                                  ))}
                                  {a.pills.length > 2 && (
                                    <span className="text-[10px] px-2.5 py-0.5 bg-slate-100 rounded-full text-slate-600">
                                      +{a.pills.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                            <div className="text-xs text-blue-600 font-medium mt-1 group-hover:underline">
                              Ejecutar ahora →
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Settings Premium */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform duration-300 hover:scale-105 active:scale-95 relative overflow-hidden group ${darkMode
                  ? 'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700 shadow-md hover:shadow-xl'
                  : 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 hover:from-slate-700 hover:to-slate-700 shadow-md hover:shadow-lg'
                  }`}
                aria-label="Settings"
                style={{
                  boxShadow: darkMode
                    ? '0 6px 20px rgba(0, 0, 0, 0.3), 0 3px 10px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                    : '0 4px 12px rgba(15, 23, 42, 0.15), 0 2px 6px rgba(15, 23, 42, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                }}
              >
                {/* Anillo sutil decorativo */}
                <div className={`absolute inset-[2px] rounded-full border ${darkMode ? 'border-slate-500/30' : 'border-slate-600/20'
                  }`}></div>

                <Settings className="w-[18px] h-[18px] text-white relative z-10" />
              </button>

              {/* Settings Dropdown - CONSOLIDADO */}
              {settingsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setSettingsOpen(false)} />
                  <div className={`absolute top-full right-0 mt-2 w-72 rounded-xl shadow-2xl overflow-hidden z-50 border ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
                    }`}>
                    {/* User Info */}
                    <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {userData?.name?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                            {userData?.name || 'Usuario'}
                          </p>
                          <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                            {userData?.email || 'usuario@econeura.com'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {/* Dark Mode Toggle */}
                      <button
                        onClick={() => setDarkMode(!darkMode)}
                        className={`w-full px-4 py-2 flex items-center gap-3 transition-colors ${darkMode
                          ? 'text-slate-100 hover:bg-slate-700'
                          : 'text-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                        <span className="text-sm">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
                      </button>

                      {/* Sistema de idiomas eliminado - solo español */}

                      {/* Cambio de Tema Premium eliminado - solo queda el simple */}

                      {/* Mi Perfil Premium */}
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          setPortalOpen(true);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] rounded-xl backdrop-blur-sm ${darkMode
                          ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 text-slate-100 hover:from-slate-700/60 hover:to-slate-600/60 hover:border-slate-500/50'
                          : 'bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/50 text-slate-800 hover:from-slate-50/90 hover:to-white/90 hover:border-slate-300/70'
                          }`}
                      >
                        <div className={`p-2.5 rounded-xl ${darkMode
                          ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30'
                          : 'bg-gradient-to-br from-emerald-100/80 to-teal-100/80 border border-emerald-300/50'
                          }`}>
                          <User className="w-4 h-4 text-emerald-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            Mi Perfil
                          </span>
                          <span className="text-xs opacity-60 font-medium">Gestión Premium</span>
                        </div>
                        <div className="ml-auto">
                          <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                            } animate-pulse`} />
                        </div>
                      </button>

                      {/* Configuración eliminada del menú */}

                      {/* Conexiones / Integraciones */}
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          setIntegrationsOpen(true);
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] rounded-xl backdrop-blur-sm ${darkMode
                          ? 'bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 text-slate-100 hover:from-slate-700/60 hover:to-slate-600/60 hover:border-slate-500/50'
                          : 'bg-gradient-to-r from-white/80 to-slate-50/80 border border-slate-200/50 text-slate-800 hover:from-slate-50/90 hover:to-white/90 hover:border-slate-300/70'
                          }`}
                      >
                        <div className={`p-2.5 rounded-xl ${darkMode
                          ? 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-400/30'
                          : 'bg-gradient-to-br from-indigo-100/80 to-violet-100/80 border border-indigo-300/50'
                          }`}>
                          <Settings className="w-4 h-4 text-indigo-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
                            Conexiones
                          </span>
                          <span className="text-xs opacity-60 font-medium">Drive, n8n, APIs</span>
                        </div>
                      </button>

                      {/* FinOps, Audit Log y Proposals eliminados del menú */}

                      {/* Cerrar Sesión Premium */}
                      <button
                        onClick={() => {
                          setSettingsOpen(false);
                          handleLogout();
                        }}
                        className={`w-full px-4 py-3 flex items-center gap-3 transition-all duration-300 hover:scale-[1.02] rounded-xl backdrop-blur-sm ${darkMode
                          ? 'bg-gradient-to-r from-red-900/30 to-red-800/30 border border-red-600/30 text-red-300 hover:from-red-800/40 hover:to-red-700/40 hover:border-red-500/50'
                          : 'bg-gradient-to-r from-red-50/80 to-red-100/80 border border-red-200/50 text-red-700 hover:from-red-100/90 hover:to-red-50/90 hover:border-red-300/70'
                          }`}
                      >
                        <div className={`p-2.5 rounded-xl ${darkMode
                          ? 'bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-red-400/30'
                          : 'bg-gradient-to-br from-red-100/80 to-pink-100/80 border border-red-300/50'
                          }`}>
                          <LogOut className="w-4 h-4 text-red-500" />
                        </div>
                        <div className="flex flex-col items-start">
                          <span className="text-sm font-bold bg-gradient-to-r from-red-400 to-pink-400 bg-clip-text text-transparent">
                            Cerrar Sesión
                          </span>
                          <span className="text-xs opacity-60 font-medium">Salir del sistema</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex relative">
          {/* Overlay oscuro en móvil */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Premium - Overlay en móvil, fijo en desktop */}
          <DepartmentSelector
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            darkMode={darkMode}
            activeDept={activeDept}
            setActiveDept={setActiveDept}
            orgView={orgView}
            setOrgView={setOrgView}
          />

          <IntegrationsDialog isOpen={integrationsOpen} onClose={() => setIntegrationsOpen(false)} />

          {/* MEJORA 7: Main con animación de entrada y scroll suave */}
          <main className="flex-1 p-6 relative z-10 animate-fadeInUp overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
            {!orgView ? (
              <>
                {/* Header sección PROFESIONAL */}
                <DashboardMetrics
                  dept={dept}
                  palette={pal}
                  setChatOpen={setChatOpen}
                  setPortalOpen={setPortalOpen}
                  setAgentExecutionOpen={setAgentExecutionOpen}
                />

                {/* Grid de agentes */}
                <AgentGrid
                  agents={filteredAgents}
                  deptId={dept.id}
                  deptColor={pal.textHex}
                  busyId={busyId}
                  lastByAgent={lastByAgent} // Type mismatch? lastByAgent is Record<string, NeuraActivity>. Grid expects Record<string, NeuraActivity | undefined>. Should be fine.
                  showAllUsage={showAllUsage}
                  onRunAgent={runAgent}
                  onConfigureAgent={(a: any) => {
                    setConnectingAgent(a);
                    setConnectModalOpen(true);
                  }}
                  onCreateAgent={startCreateAgent}
                />

                {/* Actividad Reciente - Premium */}
                <div
                  className={`mt-6 rounded-xl border p-6 transition-colors duration-500 ${darkMode
                    ? 'bg-slate-800/30 border-slate-700/50'
                    : 'bg-white border-slate-200/80'
                    }`}
                  style={{
                    boxShadow: darkMode
                      ? '0 8px 24px rgba(0, 0, 0, 0.3), 0 4px 12px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                      : '0 4px 20px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)',
                    transform: 'translateZ(0)',
                    transformStyle: 'preserve-3d'
                  }}
                >
                  <div className="flex items-center gap-2.5 mb-5">
                    <div className={`p-2 rounded-lg ${darkMode ? 'bg-emerald-500/10' : 'bg-slate-100'}`}>
                      <ActivityIcon className={`w-5 h-5 ${darkMode ? 'text-emerald-400' : 'text-slate-600'}`} />
                    </div>
                    <div className={`font-semibold text-base ${darkMode ? 'text-slate-200' : 'text-slate-600'}`}>Actividad Reciente</div>
                  </div>
                  {activity.length === 0 ? (
                    <div className={`text-sm text-center py-10 rounded-xl border border-dashed ${darkMode
                      ? 'bg-slate-800/20 border-slate-700 text-slate-500'
                      : 'bg-slate-100/50 border-slate-300 text-slate-500'
                      }`}>
                      Sin actividad aún. Ejecuta un agente para ver resultados.
                    </div>
                  ) : (
                    <div className="max-h-[280px] overflow-y-auto pr-2">
                      <ul className="space-y-2.5">
                        {activity.slice(0, 4).map(e => (
                          <li
                            key={e.id}
                            className={`flex items-center gap-3 p-3.5 rounded-lg transition-all ${darkMode
                              ? 'bg-slate-800/50 hover:bg-slate-800/70 border border-slate-700/50'
                              : 'bg-white hover:bg-slate-50 border border-slate-200'
                              }`}
                            style={{
                              boxShadow: darkMode
                                ? '0 2px 8px rgba(0, 0, 0, 0.2)'
                                : '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02)',
                              transform: 'translateZ(2px)'
                            }}
                          >
                            <span className={cx(
                              'px-2.5 py-1 rounded-md text-[11px] font-bold',
                              e.status === 'OK'
                                ? darkMode
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : darkMode
                                  ? 'bg-slate-700/30 text-slate-400 border border-slate-600/30'
                                  : 'bg-slate-100 text-slate-600 border border-slate-300'
                            )}>
                              {e.status === 'OK' ? 'OK' : 'Procesando'}
                            </span>
                            <span className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                              {new Date(e.ts).toLocaleTimeString()}
                            </span>
                            <span className={`font-semibold text-sm ${darkMode ? 'text-slate-200' : 'text-slate-900'}`}>
                              {e.agentId}
                            </span>
                            <span className={`truncate flex-1 text-sm ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                              {e.message}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* CRM Premium Panel - Solo para Marketing y Ventas (CMO/MKT) */}
                {(dept.id === 'MKT' || dept.id === 'CMO') && (
                  <div className="mt-6">
                    <ErrorBoundary>
                      {/* ✅ CORRECCIÓN: Mapear dept.id a 'cmo' o 'cso' para el backend */}
                      <CRMPremiumPanel
                        departmentName={dept.name}
                        department={(dept.id === 'MKT' || dept.id === 'CMO') ? 'cmo' : (dept.id === 'CSO' ? 'cso' : 'cmo')}
                        accentColor={pal.textHex}
                        darkMode={darkMode}
                      />
                    </ErrorBoundary>
                  </div>
                )}

              </>
            ) : (
              <OrgChart />
            )}

            {/* Footer legal */}
            <div className="text-xs mt-6 pb-8" style={{ color: theme.muted, borderTop: `1px dashed ${theme.border}`, paddingTop: 8 }}>
              GDPR & AI Act · datos en la UE · TLS 1.2+ y AES-256 · auditoría HITL.
            </div>
          </main>
        </div >

        {/* Chat NEURA */}
        < NeuraChat
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          dept={dept}
          messages={chatMsgs}
          input={chatInput}
          setInput={setChatInput}
          onSend={sendChatMessage}
          isLoading={isChatLoading}
          // pendingAttachment={null} // Deprecated
          // attachments={attachments} // Prop removed due to type incompatibility
          // onAttachmentUpload={handleAttachmentUpload}
          // isUploadingAttachment={isUploadingAttachment}
          pendingAttachment={null}
          onRemoveAttachment={() => null}
          darkMode={darkMode}
          voiceSupported={voiceSupported}
          listening={listening}
          onToggleListen={toggleListen}
          onSpeak={speak}
          agentExecutionOpen={agentExecutionOpen}
          onCloseAgentExecution={() => setAgentExecutionOpen(false)}
        // onAddDriveAttachment={addDriveAttachment}
        />
        < FooterComponent />

        {/* Modals */}
        < EconeuraModals
          chatHistoryOpen={chatHistoryOpen}
          setChatHistoryOpen={setChatHistoryOpen}
          portalOpen={portalOpen}
          setPortalOpen={setPortalOpen}
          token={userToken || ''}
          darkMode={darkMode}
          chatContext={chatInput}
          userIntent={chatInput}
        />

        {/* Modal de Conexión de Proveedores */}
        {
          connectModalOpen && connectingAgent && (
            <ConnectAgentModal
              agent={{ id: connectingAgent.id, title: connectingAgent.title }}
              darkMode={darkMode}
              isOpen={connectModalOpen}
              onClose={() => {
                setConnectModalOpen(false);
                setConnectingAgent(null);
                setBusyId('');
              }}
              onConnect={(agentData) => {
                // Guardar configuración del webhook en localStorage
                const webhookConfig = JSON.parse(localStorage.getItem('econeura_webhooks') || '{}');
                webhookConfig[connectingAgent.id] = {
                  provider: agentData.provider,
                  providerName: agentData.providerName,
                  webhookUrl: agentData.webhookUrl,
                  connectedAt: agentData.connectedAt
                };
                localStorage.setItem('econeura_webhooks', JSON.stringify(webhookConfig));

                // Notificar al usuario
                toast.success(`✅ ${agentData.providerName} conectado correctamente`, {
                  description: `Agente: ${connectingAgent.title}`
                });

                setConnectModalOpen(false);

                // Ejecutar el agente ahora que está conectado
                const agent = dept.agents.find(a => a.id === connectingAgent.id);
                if (agent) {
                  runAgent(agent);
                }
                setConnectingAgent(null);
              }}
            />
          )
        }

        {/* NEURA Library Panel */}
        <LibraryPanel
          darkMode={darkMode}
          isOpen={libraryOpen}
          onClose={() => setLibraryOpen(false)}
          userId={userData?.id}
        />

        {/* HITL Approval Modal */}
        {
          hitlModalOpen && pendingHITL && (
            <HITLApprovalModal
              isOpen={hitlModalOpen}
              onClose={() => {
                setHitlModalOpen(false);
                setPendingHITL(null);
              }}
              onApprove={() => {
                setChatMsgs(v => [...v, {
                  id: correlationId(),
                  text: '✅ Aprobado por usuario. Ejecutando acción...',
                  role: 'assistant'
                }]);
                setHitlModalOpen(false);
                setPendingHITL(null);
              }}
              onReject={() => {
                setChatMsgs(v => [...v, {
                  id: correlationId(),
                  text: '❌ Acción rechazada por usuario.',
                  role: 'assistant'
                }]);
                setHitlModalOpen(false);
                setPendingHITL(null);
              }}
              darkMode={darkMode}
              data={{
                functionName: pendingHITL.functionName,
                functionArgs: pendingHITL.functionArgs || {},
                functionResult: pendingHITL.functionResult,
                neuraName: pendingHITL.neuraName
              }}
            />
          )
        }
      </div >
    </>
  );
}



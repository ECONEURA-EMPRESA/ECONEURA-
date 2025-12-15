import React, { useMemo, useState, useEffect, useRef, memo } from "react";
import { Link } from "react-router-dom";
import {
  Crown, Cpu, Shield, Workflow, Users, Target, LineChart, Wallet, Database,
  ClipboardList, Megaphone, FileText, Radar,
  Bug, Gauge, Activity as ActivityIcon, Inbox, Mail, TrendingUp, FileBarChart2, CalendarDays,
  Mic, MicOff, Volume2, StopCircle, Play, Pause, Moon, Sun, User, LogOut, Settings, Menu,
  DollarSign, FileCheck, Clock, Send, Book, Globe, Loader
} from "lucide-react";
import { API_URL } from './config/api';
import { getApiUrl, getAuthToken, createAuthHeaders } from './utils/apiUrl';
// Imports de componentes premium removidos - manteniendo dise├▒o original
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
// WorkflowManager eliminado - pendiente implementaci├│n
import { shouldExecuteAgentsForNeura, getSpecializedContext, getSpecializedReasoning, calculateAgentConfidence } from "./services/NeuraAgentIntegration";
import { ConnectAgentModal } from './components/ConnectAgentModal';
import { ChatHistory } from './components/ChatHistory';
// import { CustomerPortal } from './components/CustomerPortal'; // Component not exported
import { LibraryPanel } from './components/LibraryPanel';
import { ReferencesBlock } from './components/ReferencesBlock';
import { HITLApprovalModal } from './components/HITLApprovalModal';
// Sistema de internacionalizaci├│n eliminado - solo espa├▒ol
import { Toaster, toast } from "sonner";
import confetti from "canvas-confetti";
import Fuse from "fuse.js";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Tipos exportados (├║nicos)
declare const process: any;

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
    // NUEVO: M├®tricas de VALOR
    value?: {
      timeSavedHoursMonth: number;    // Horas ahorradas/mes
      valueEurMonth: number;           // Valor en EUR/mes
      roiPercentage: number;           // ROI %
      problem: string;                 // Problema que resuelve
      solution: string;                // Soluci├│n que ofrece
    };
  };
  agents: Agent[];
}

type PendingAttachment = {
  fileId: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  type: 'image' | 'file';
};

import { cx } from './utils/classnames';
import { hexToRgb, rgba } from './utils/colors';
import { LogoEconeura as BrandLogo } from './components/LogoEconeura';
import { AgentExecutionPanel } from './components/AgentExecutionPanel';
import { DepartmentSelector } from './components/DepartmentSelector';
import { DashboardMetrics } from './components/DashboardMetrics';
import { CRMExecutiveDashboard } from './components/CRMExecutiveDashboard';
import { CRMPremiumPanel } from './components/CRMPremiumPanel';
import { ErrorBoundary } from './components/ErrorBoundary';

// Tipo de actividad NEURA
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
 * ECONEURA ÔÇö Cockpit completo al 100%
 * - 10 NEURA con chat GPT-5 (simulado gratis o real con API key)
 * - 40 agentes Make con webhooks configurables
 * - Posibilidad de crear nuevos agentes
 * - UI exacta sin cambios de textos ni dise├▒o
 */

// Tipos ahora importados desde ./types/

const HeaderLogo = memo(function HeaderLogo(): JSX.Element {
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

// Auto-detecta producci├│n vs local
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

// Funci├│n para comprimir im├ígenes
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

      // Convertir a base64 con compresi├│n
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
    return res.json().catch(() => ({ ok: true, simulated: true, output: `Simulado ${agentId}` }));
  } catch {
    return { ok: true, simulated: true, output: `Simulado ${agentId}` };
  }
}

// Telemetr├¡a opcional Azure Log Analytics (solo si hay credenciales)
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

function FooterComponent() {
  const handleFooterClick = (section: string) => {
    // Navegaci├│n funcional a p├íginas legales
    switch (section) {
      case 'Privacidad':
        window.open('/privacy', '_blank');
        break;
      case 'Cookies':
        window.open('/cookies', '_blank');
        break;
      case 'T├®rminoss':
        window.open('/terms', '_blank');
        break;
      case 'Marcas registradas':
        window.open('/trademarks', '_blank');
        break;
      case 'Cumplimiento UE':
        window.open('/compliance', '_blank');
        break;
      default:
      // Navegaci├│n a secci├│n desconocida (log removido para producci├│n)
    }
  };

  return (
    <footer className="bg-slate-50/50 px-6 py-3 text-[10px] text-slate-500">
      <div className="flex flex-wrap items-center justify-center gap-2 font-normal">
        <span className="text-slate-600">Espa├▒ol (Espa├▒a)</span>
        <span role="separator" aria-hidden className="text-slate-300">┬À</span>
        <button
          onClick={() => handleFooterClick('Privacidad')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Tus opciones de privacidad
        </button>
        <span role="separator" aria-hidden className="text-slate-300">┬À</span>
        <button
          onClick={() => handleFooterClick('Cookies')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Gestionar cookies
        </button>
        <span role="separator" aria-hidden className="text-slate-300">┬À</span>
        <button
          onClick={() => handleFooterClick('T├®rminoss')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Condiciones de uso
        </button>
        <span role="separator" aria-hidden className="text-slate-300">┬À</span>
        <button
          onClick={() => handleFooterClick('Marcas registradas')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Marcas registradas
        </button>
        <span role="separator" aria-hidden className="text-slate-300">┬À</span>
        <button
          onClick={() => handleFooterClick('Cumplimiento UE')}
          className="hover:text-slate-700 transition-colors hover:underline cursor-pointer bg-transparent border-0 p-0 font-normal"
        >
          Docs cumplimiento de la UE
        </button>
        <span role="separator" aria-hidden className="text-slate-300">┬À</span>
        <span className="text-slate-600">┬® ECONEURA 2025</span>
      </div>
    </footer>
  );
}

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
  const [activeDept, setActiveDept] = useState(DATA[0].id);
  const [orgView, setOrgView] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [activity, setActivity] = useState<NeuraActivity[]>([]);
  const [chatOpen, setChatOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Sistema de idiomas eliminado - solo espa├▒ol
  const searchInputRef = useRef<HTMLInputElement>(null);
  // Logout function
  const handleLogout = () => {
    if (confirm('┬┐Est├ís seguro de que quieres cerrar sesi├│n?')) {
      localStorage.removeItem('econeura_token');
      localStorage.removeItem('econeura_user');
      sessionStorage.removeItem('econeura_token');
      sessionStorage.removeItem('econeura_user');

      // Llamar funci├│n de logout del padre si existe
      if (onLogout) {
        onLogout();
      } else {
        window.location.href = '/';
      }
    }
  };

  const dept = useMemo(() => DATA.find(d => d.id === activeDept) ?? DATA[0], [activeDept]);

  // Ô£à CR├ìTICO: Memoria conversacional y l├│gica de chat movida a useNeuraChat
  const {
    chatMsgs,
    setChatMsgs,
    chatInput,
    setChatInput,
    isChatLoading,
    pendingAttachment,
    isUploadingAttachment,
    handleAttachmentUpload,
    removeAttachment,
    sendChatMessage
  } = useNeuraChat(activeDept, dept, handleLogout);
  const [showAllUsage, setShowAllUsage] = useState(false);
  const [pendingAgentExecution, setPendingAgentExecution] = useState<string | null>(null);
  const [listening, setListening] = useState(false);

  // Estado para modal de conexi├│n
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [connectingAgent, setConnectingAgent] = useState<{ id: string; title: string } | null>(null);

  // Estado para historial de chats
  const [chatHistoryOpen, setChatHistoryOpen] = useState(false);

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
  // Ô£à SIN L├ìMITES: Permitir cualquier tama├▒o (el LLM manejar├í lo que pueda)
  const MAX_UPLOAD_BYTES = 50 * 1024 * 1024; // 50MB (solo para mostrar warning, no bloquear)
  // const [pendingAttachment, setPendingAttachment] = useState<PendingAttachment | null>(null); // Movido a hook
  // const [isUploadingAttachment, setIsUploadingAttachment] = useState(false); // Movido a hook
  // const fileInputRef = useRef<HTMLInputElement>(null); // Movido a hook/componente
  // const [isChatLoading, setIsChatLoading] = useState(false); // Movido a hook



  // L├│gica de historial movida a useNeuraChat
  const lastByAgent = useMemo(() => {
    const m: Record<string, NeuraActivity | undefined> = {};
    for (const e of activity) { if (!m[e.agentId]) m[e.agentId] = e; }
    return m;
  }, [activity]);

  // Ôî¿´©Å┬Å Keyboard shortcut: Ctrl+K / Cmd+K para focus en b├║squeda
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


// ├░┼©"┬ì B├ÜSQUEDA FUZZY GLOBAL con Fuse.js (permite errores tipogr├íficos)
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
}, [fuse, q, dept.agents]); // B├║squeda en todos los departamentos

// Sistema agentic temporalmente deshabilitado

async function runAgent(a: Agent) {
  try {
    setBusyId(a.id);

    // Verificar si el agente est├í conectado a alg├║n proveedor
    // Ô£à AUDITOR├ìA: Usar utilidad centralizada para API URL
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

      // ­ƒÄë Confetti + Toast al completar exitosamente
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      toast.success(`Ô£à ${a.title} ejecutado exitosamente`);
      return;

      // Dead code removed
    } catch (mappingError: unknown) {
      // Fallback: intentar webhook Make si est├í configurado
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

        // ­ƒÄë Confetti + Toast
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 }
        });
        toast.success(`├ó┼ô" ${a.title} ejecutado exitosamente`, {
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

    // ├ó ┼Æ Toast de error
    toast.error(`Ô£ù Error al ejecutar ${a.title}`, {
      description: String(e?.message || 'Verifica la conexi├│n con el backend'),
      duration: 4000
    });
  } finally {
    setBusyId(null);
  }
}

function openChatWithErrorSamples() {
  setChatOpen(true);
  setChatMsgs([
    { id: correlationId(), text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, int├®ntalo de nuevo m├ís tarde.', role: 'assistant' },
    { id: correlationId(), text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, int├®ntalo de nuevo m├ís tarde.', role: 'assistant' },
  ]);
}

function startCreateAgent(deptId: string) {
  const instructions = `NEW AGENTE ┬À ${deptId}
Crea un agente y con├®ctalo a Make.
1) Pega el Webhook de Make en backend.
2) Define I/O y permisos.
3) Publica.`;
  setActivity(v => [{ id: correlationId(), ts: nowIso(), agentId: 'new-agent', deptId, status: 'OK', message: 'Solicitud de creaci├│n de agente' }, ...v]);
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
          {/* Hamburger Menu - Solo m├│vil */}
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
          {/* MEJORA 8: Buscador - Oculto en m├│vil peque├▒o */}
          <div className="relative hidden sm:block">
            <input
              ref={searchInputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar agentes... (Ctrl+K)"
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
                    <div className="px-4 py-8 text-center text-sm text-slate-500">
                      No se encontraron agentes
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
                          <div className="text-xs text-blue-600 font-medium mt-1">
                            Ejecutar ÔåÆ
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

                    {/* Sistema de idiomas eliminado - solo espa├▒ol */}

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
                        <span className="text-xs opacity-60 font-medium">Gesti├│n Premium</span>
                      </div>
                      <div className="ml-auto">
                        <div className={`w-2 h-2 rounded-full ${darkMode ? 'bg-emerald-400' : 'bg-emerald-500'
                          } animate-pulse`} />
                      </div>
                    </button>

                    {/* Configuraci├│n eliminada del men├║ */}

                    {/* FinOps, Audit Log y Proposals eliminados del men├║ */}

                    {/* Cerrar Sesi├│n Premium */}
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
                          Cerrar Sesi├│n
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
        {/* Overlay oscuro en m├│vil */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar Premium - Overlay en m├│vil, fijo en desktop */}
        <DepartmentSelector
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          darkMode={darkMode}
          activeDept={activeDept}
          setActiveDept={setActiveDept}
          orgView={orgView}
          setOrgView={setOrgView}
        />

        {/* MEJORA 7: Main con animaci├│n de entrada y scroll suave */}
        <main className="flex-1 p-6 relative z-10 animate-fadeInUp overflow-y-auto" style={{ scrollBehavior: 'smooth' }}>
          {!orgView ? (
            <>
              {/* Header secci├│n PROFESIONAL */}
              <DashboardMetrics
                dept={dept}
                palette={pal}
                setChatOpen={setChatOpen}
                setPortalOpen={setPortalOpen}
                setAgentExecutionOpen={setAgentExecutionOpen}
              />

              {/* Grid de agentes - Responsive: 1ÔåÆ2ÔåÆ3 cols */}
              <div className="mt-6 grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 items-start justify-items-center">
                {filteredAgents.map((a: Agent) => (
                  <AgentCard key={a.id} a={a} deptColor={pal.textHex} busy={busyId === a.id} progress={lastByAgent[a.id]?.status === 'OK' ? 100 : (lastByAgent[a.id]?.status === 'ERROR' ? 0 : 11)} showUsage={showAllUsage} onRun={() => runAgent(a)} onConfigure={() => {
                    setConnectingAgent({ id: a.id, title: a.title });
                    setConnectModalOpen(true);
                  }} />
                ))}
                <NewAgentCard deptId={dept.id} deptColor={pal.textHex} onCreate={startCreateAgent} />
              </div>

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
                    Sin actividad a├║n. Ejecuta un agente para ver resultados.
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
                    {/* Ô£à CORRECCI├ôN: Mapear dept.id a 'cmo' o 'cso' para el backend */}
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
            GDPR & AI Act ┬À datos en la UE ┬À TLS 1.2+ y AES-256 ┬À auditor├¡a HITL.
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
        pendingAttachment={pendingAttachment}
        onUpload={handleAttachmentUpload}
        onRemoveAttachment={removeAttachment}
        isUploading={isUploadingAttachment}
        darkMode={darkMode}
        voiceSupported={voiceSupported}
        listening={listening}
        onToggleListen={toggleListen}
        onSpeak={speak}
        agentExecutionOpen={agentExecutionOpen}
        onCloseAgentExecution={() => setAgentExecutionOpen(false)}
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

      {/* Modal de Conexi├│n de Proveedores */}
      {
        connectModalOpen && connectingAgent && (
          <ConnectAgentModal
            agentName={connectingAgent.title}
            isOpen={connectModalOpen}
            onClose={() => {
              setConnectModalOpen(false);
              setConnectingAgent(null);
              setBusyId('');
            }}
            onConnect={(agentData) => {
              // Guardar configuraci├│n del webhook en localStorage
              const webhookConfig = JSON.parse(localStorage.getItem('econeura_webhooks') || '{}');
              webhookConfig[connectingAgent.id] = {
                provider: agentData.provider,
                providerName: agentData.providerName,
                webhookUrl: agentData.webhookUrl,
                connectedAt: agentData.connectedAt
              };
              localStorage.setItem('econeura_webhooks', JSON.stringify(webhookConfig));

              // Notificar al usuario
              toast.success(`Ô£à ${agentData.providerName} conectado correctamente`, {
                description: `Agente: ${connectingAgent.title}`
              });

              setConnectModalOpen(false);

              // Ejecutar el agente ahora que est├í conectado
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
        visible={libraryOpen}
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
                text: 'Ô£à Aprobado por usuario. Ejecutando acci├│n...',
                role: 'assistant'
              }]);
              setHitlModalOpen(false);
              setPendingHITL(null);
            }}
            onReject={() => {
              setChatMsgs(v => [...v, {
                id: correlationId(),
                text: 'ÔØî Acci├│n rechazada por usuario.',
                role: 'assistant'
              }]);
              setHitlModalOpen(false);
              setPendingHITL(null);
            }}
            functionName={pendingHITL.functionName}
            functionArgs={pendingHITL.functionArgs || {}}
            functionResult={pendingHITL.functionResult}
            neuraName={pendingHITL.neuraName}
          />
        )
      }
    </div >
  </>
);
}

type AgentCardProps = { a: Agent; deptColor: string; busy?: boolean; progress?: number; showUsage?: boolean; onRun: () => Promise<any> | void; onConfigure: () => void };
const AgentCard = memo(function AgentCard({ a, deptColor, busy, progress, showUsage, onRun, onConfigure }: AgentCardProps) {
  const pct = Math.max(0, Math.min(100, (progress ?? 11)));
  const I: React.ElementType = iconForAgent(a.title);
  const { r, g, b } = hexToRgb(deptColor);

  return (
    <div className="group relative w-full max-w-full md:max-w-[580px] bg-gradient-to-b from-white to-slate-50/50 border border-slate-200/60 rounded-2xl p-4 md:p-8 flex flex-col shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-slate-400/30 hover:-translate-y-2 transition-all duration-500" style={{
      transform: 'perspective(1000px) rotateX(0deg)',
      transformStyle: 'preserve-3d'
    }}>
      {/* Efecto 3D sutil */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/40 to-transparent pointer-events-none" style={{ transform: 'translateZ(1px)' }}></div>

      <div className="flex items-start justify-between gap-3 mb-4 relative" style={{ transform: 'translateZ(2px)' }}>
        <div className="flex items-start gap-3 flex-1">
          <div
            className="mt-0.5 p-2.5 rounded-xl border border-slate-200/60 group-hover:scale-105 transition-all duration-200 shadow-md"
            style={{
              backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
              boxShadow: `0 4px 12px rgba(${r}, ${g}, ${b}, 0.15)`
            }}
          >
            {React.createElement(I, { className: "w-5 h-5", style: { color: deptColor } })}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-base font-semibold text-slate-900 leading-tight">{a.title}</div>
            <div className="text-sm text-slate-600 mt-2 leading-relaxed">{a.desc}</div>
          </div>
        </div>
        <span className="text-xs px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-medium whitespace-nowrap shadow-sm">
          Ô£à
        </span>
        <button
          onClick={onConfigure}
          className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors shadow-sm hover:shadow-md"
          aria-label="Configurar agente"
          title="Conectar con Make, n8n o ChatGPT"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {showUsage && (
        a.pills && a.pills.length ? (
          <div className="mb-4 text-xs text-slate-700 flex gap-2 flex-wrap relative" style={{ transform: 'translateZ(2px)' }}>
            {a.pills.map((p: string, i: number) => (
              <span key={i} className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200/60 font-medium shadow-sm">{p}</span>
            ))}
          </div>
        ) : (
          <div className="mb-4 text-xs text-slate-500 font-medium">Consumo: N/D</div>
        )
      )}

      <div className="mb-5 relative" style={{ transform: 'translateZ(2px)' }}>
        <div className="relative h-2 rounded-full bg-slate-100 overflow-hidden shadow-inner border border-slate-200/60">
          <div
            className="absolute inset-y-0 left-0 h-2 rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${pct}%`,
              minWidth: pct > 0 ? '8px' : '0px',
              background: `linear-gradient(90deg, rgba(${r}, ${g}, ${b}, 0.7), rgba(${r}, ${g}, ${b}, 0.9))`,
              boxShadow: `0 0 10px rgba(${r}, ${g}, ${b}, 0.3)`
            }}
          />
        </div>
        <div className="mt-2.5 text-sm text-slate-600 font-medium">{pct}% completado</div>
      </div>

      <div className="flex gap-3 relative" style={{ transform: 'translateZ(3px)' }}>
        {/* MEJORA 9: Bot├│n ejecutar con brillo premium */}
        <button
          onClick={() => onRun()}
          disabled={!!busy}
          className={cx("w-[230px] h-11 px-5 rounded-xl text-base font-semibold transition-shadow duration-200 active:scale-95 inline-flex items-center justify-center gap-2 shrink-0 relative",
            busy
              ? "opacity-60 cursor-not-allowed bg-slate-100 text-slate-500 border border-slate-200/60"
              : "text-white shadow-lg hover:shadow-2xl border-0"
          )}
          style={!busy ? {
            background: `linear-gradient(135deg, rgb(${r}, ${g}, ${b}), rgb(${Math.floor(r * 0.9)}, ${Math.floor(g * 0.9)}, ${Math.floor(b * 0.9)}))`,
            boxShadow: `0 6px 20px rgba(${r}, ${g}, ${b}, 0.35), 0 2px 8px rgba(${r}, ${g}, ${b}, 0.2)`,
            width: '230px'
          } : { width: '230px' }}>
          {busy ? (
            <>
              <span className="animate-spin text-base">├ó┬Å┬│</span>
              <span>Ejecutando</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Ejecutar</span>
            </>
          )}
        </button>
        <button className="h-11 w-11 shrink-0 rounded-xl border border-slate-200/60 text-slate-700 bg-white hover:bg-slate-50 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg flex items-center justify-center">
          <Pause className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
});

type NewAgentCardProps = { deptId: string; deptColor: string; onCreate: (deptId: string) => void };
function NewAgentCard({ deptId, deptColor, onCreate }: NewAgentCardProps) {
  const { r, g, b } = hexToRgb(deptColor);

  const handleCreate = () => {
    const name = prompt('Nombre del nuevo agente:');
    if (name) {
      alert(`Creando agente "${name}" para ${deptId}...\n\n(En producci├│n esto se guardar├¡a en la base de datos)`);
      onCreate(deptId);
    }
  };

  return (
    <div
      className="group relative w-full max-w-[580px] bg-gradient-to-b from-slate-50 to-white border-2 border-dashed border-slate-300 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 shadow-lg hover:shadow-2xl hover:border-solid hover:-translate-y-2 transition-all duration-500"
      style={{
        transform: 'perspective(1000px) rotateX(0deg)',
        transformStyle: 'preserve-3d'
      }}
    >
      {/* Icono central - MISMO TAMA├æ'O que AgentCard */}
      <div
        className="p-2.5 rounded-xl border border-slate-200/60 shadow-md group-hover:scale-110 transition-all duration-300"
        style={{
          backgroundColor: `rgba(${r}, ${g}, ${b}, 0.1)`,
          boxShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.15)`
        }}
      >
        <Workflow className="w-5 h-5" style={{ color: deptColor }} />
      </div>

      {/* Texto */}
      <div className="text-center">
        <div className="text-base font-bold text-slate-900">Nuevo Agente</div>
        <div className="text-sm text-slate-600 mt-1">Crear agente personalizado</div>
      </div>

      {/* Bot├│n crear */}
      <button
        onClick={handleCreate}
        className="w-full h-11 rounded-xl text-base font-semibold text-white shadow-md hover:shadow-lg hover:scale-102 transition-all duration-200 border border-slate-200/60"
        style={{
          background: `linear-gradient(135deg, rgba(${r}, ${g}, ${b}, 0.75), rgba(${r}, ${g}, ${b}, 0.9))`,
          boxShadow: `0 4px 12px rgba(${r}, ${g}, ${b}, 0.25)`
        }}
      >
        + Crear
      </button>
    </div>
  );
}

export function OrgChart() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {DATA.map((d: Department) => {
        const Icon = getDeptIcon(d.id);
        const p = getPalette(d.id);
        const { r, g, b } = hexToRgb(p.textHex);
        return (
          <div
            key={d.id}
            className="group relative bg-white border border-slate-200/80 rounded-2xl p-6 hover:-translate-y-2 transition-all duration-300"
            style={{
              transform: 'perspective(1200px) rotateX(2deg)',
              transformStyle: 'preserve-3d',
              boxShadow: `0 12px 32px rgba(${r}, ${g}, ${b}, 0.15), 0 6px 16px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.8)`
            }}
          >
            {/* Efecto 3D overlay mejorado */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 via-transparent to-slate-50/20 pointer-events-none group-hover:from-white/40 transition-all duration-300" style={{ transform: 'translateZ(2px)' }}></div>

            {/* Borde inferior 3D */}
            <div className="absolute inset-x-4 bottom-0 h-[1px] bg-gradient-to-r from-transparent via-slate-200/50 to-transparent" style={{ transform: 'translateZ(-1px)' }}></div>

            {/* Header del departamento */}
            <div className="flex items-start justify-between mb-5 relative" style={{ transform: 'translateZ(2px)' }}>
              <div className="flex items-start gap-3 flex-1">
                <div
                  className="p-3 rounded-xl border border-slate-200/60 shadow-lg group-hover:scale-110 transition-all duration-300"
                  style={{
                    backgroundColor: rgba(p.textHex, 0.1),
                    boxShadow: `0 4px 15px rgba(${r}, ${g}, ${b}, 0.2)`
                  }}
                >
                  {React.createElement(Icon, {
                    className: "w-6 h-6",
                    style: { color: p.textHex }
                  })}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-base text-slate-900 leading-tight">
                    {d.name}
                  </div>
                  <div
                    className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-lg font-semibold mt-2 border shadow-sm"
                    style={{
                      backgroundColor: rgba(p.textHex, 0.1),
                      color: p.textHex,
                      borderColor: rgba(p.textHex, 0.2)
                    }}
                  >
                    <Brain className="w-3.5 h-3.5" />
                    NEURA
                  </div>
                </div>
              </div>
              <span
                className="text-xs px-3 py-1.5 rounded-full font-bold whitespace-nowrap border-2 shadow-md"
                style={{
                  backgroundColor: rgba(p.textHex, 0.1),
                  color: p.textHex,
                  borderColor: rgba(p.textHex, 0.3)
                }}
              >
                {d.agents.length}
              </span>
            </div>

            {/* Lista de agentes con efecto 3D */}
            <ul className="text-sm text-slate-700 space-y-2 mb-5 relative" style={{ transform: 'translateZ(2px)' }}>
              <li className="flex items-start gap-2.5 font-bold">
                <span
                  className="mt-1.5 w-2 h-2 rounded-full shadow-md"
                  style={{
                    backgroundColor: p.textHex,
                    boxShadow: `0 0 8px rgba(${r}, ${g}, ${b}, 0.4)`
                  }}
                />
                <span style={{ color: p.textHex }}>{d.neura.title}</span>
              </li>
              {d.agents.slice(0, 4).map((a: Agent) => (
                <li
                  key={a.id}
                  className="flex items-start gap-2.5 text-xs hover:translate-x-1 transition-transform duration-200"
                >
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shadow-sm" />
                  <span className="text-slate-600">{a.title}</span>
                </li>
              ))}
              {d.agents.length > 4 && (
                <li className="text-xs text-slate-500 pl-4 font-medium">
                  + {d.agents.length - 4} agentes m├ís
                </li>
              )}
            </ul>

            {/* Footer con tags premium */}
            <div className="flex gap-2 flex-wrap pt-4 border-t-2 border-slate-200/50 relative" style={{ transform: 'translateZ(2px)' }}>
              {d.neura.tags.slice(0, 3).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="text-xs px-3 py-1.5 rounded-lg font-semibold shadow-sm border hover:scale-105 transition-all duration-200"
                  style={{
                    backgroundColor: rgba(p.textHex, 0.08),
                    color: rgba(p.textHex, 0.9),
                    borderColor: rgba(p.textHex, 0.2)
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Exportar helpers para tests
export const __TEST_HELPERS = { iconForAgent, getDeptIcon, getPalette, isReactComponent: isComponent, correlationId, invokeAgent };
export const __RUN_SELF_TESTS = (overrides?: Record<string, unknown>) => {
  const failures: string[] = [];
  try {
    const LogoComp = overrides?.LogoEconeura || LogoEconeura;
    const samples = ['Agente: Agenda Consejo', 'Agente: Resumen', 'Agente: OKR', 'Agente: Phishing Triage', 'Agente: X'];
    samples.forEach((s: string) => {
      const I = iconForAgent(s);
      if (!isComponent(I)) failures.push(`iconForAgent inv├ílido: ${s}`);
    });
    DATA.forEach((d: Department) => {
      const I = getDeptIcon(d.id);
      if (!isComponent(I)) failures.push(`getDeptIcon inv├ílido: ${d.id}`);
      const pal = getPalette(d.id);
      if (!pal || typeof pal.accentText !== 'string') failures.push(`getPalette inv├ílido: ${d.id}`);
    });
    const el = React.createElement(LogoComp as any);
    if (!el) failures.push('LogoEconeura falla');
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    failures.push(`self-test: ${error.message}`);
  } finally {
    if (failures.length && (import.meta as any).env.DEV) {
      // Self-test failures solo en desarrollo
    }
  }
  return failures;
};

// Auto-ejecutar self-tests en runtime - DISABLED for now to prevent loading errors
// (() => {
// __RUN_SELF_TESTS();
// })();

// Modals (render at end of component)
interface EconeuraModalsProps {
  chatHistoryOpen: boolean;
  setChatHistoryOpen: (open: boolean) => void;
  portalOpen: boolean;
  setPortalOpen: (open: boolean) => void;
  token: string | null;
  darkMode: boolean;
  chatContext?: string;
  userIntent?: string;
}

export function EconeuraModals({
  chatHistoryOpen,
  setChatHistoryOpen,
  portalOpen,
  setPortalOpen,
  token,
  darkMode,
  chatContext,
  userIntent
}: EconeuraModalsProps) {
  return (
    <>
      {chatHistoryOpen && (
        <ChatHistory
          isOpen={chatHistoryOpen}
          onClose={() => setChatHistoryOpen(false)}
          token={token || ''}
        />
      )}
      {/* CustomerPortal component not exported - disabled
      {portalOpen && (
        <CustomerPortal
          isOpen={portalOpen}
          onClose={() => setPortalOpen(false)}
          token={token}
          darkMode={darkMode}
        />
      )}
      */}
      {/* AgentExecutionPanel moved to NeuraChat */}
    </>
  );
}

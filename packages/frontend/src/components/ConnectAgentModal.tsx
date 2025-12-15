import React, { useState } from 'react';
import { X, Check, ExternalLink, Zap, Workflow, MessageSquare, Cpu } from 'lucide-react';

interface ConnectAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent: { id: string; title: string };
  darkMode: boolean;
  onConnect?: (agentData: any) => void;
}

type Provider = {
  id: string;
  name: string;
  icon: React.ElementType;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
  docs: string;
};

const PROVIDERS: Provider[] = [
  {
    id: 'make',
    name: 'Make.com',
    icon: Zap,
    description: 'Automatización visual sin código. Ideal para workflows complejos.',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    docs: 'https://www.make.com/en/help/webhooks'
  },
  {
    id: 'n8n',
    name: 'n8n',
    icon: Workflow,
    description: 'Automatización open-source. Control total y self-hosted.',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    docs: 'https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.webhook/'
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT Actions',
    icon: MessageSquare,
    description: 'GPT personalizado con acciones. Conecta con APIs externas.',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    docs: 'https://platform.openai.com/docs/actions'
  },
  {
    id: 'zapier',
    name: 'Zapier',
    icon: Cpu,
    description: 'Miles de integraciones pre-built. Setup rápido.',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    docs: 'https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks'
  }
];

export function ConnectAgentModal({ isOpen, onClose, onConnect, agent }: ConnectAgentModalProps) {
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [step, setStep] = useState<'select' | 'configure'>('select');

  if (!isOpen) return null;

  const handleProviderSelect = (providerId: string) => {
    setSelectedProvider(providerId);
    setStep('configure');
  };

  const handleBack = () => {
    setStep('select');
    setSelectedProvider(null);
    setWebhookUrl('');
  };

  const handleConnect = () => {
    if (!selectedProvider || !webhookUrl.trim()) return;

    const provider = PROVIDERS.find(p => p.id === selectedProvider);

    if (onConnect) {
      onConnect({
        provider: selectedProvider,
        providerName: provider?.name,
        webhookUrl: webhookUrl.trim(),
        agentName: agent.title,
        connectedAt: new Date().toISOString()
      });
    }

    // Reset and close
    setStep('select');
    setSelectedProvider(null);
    setWebhookUrl('');
    onClose();
  };

  const selectedProviderData = PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Conectar Agente</h2>
            {agent && (
              <p className="text-sm text-slate-600 mt-1">Configurar: <span className="font-semibold">{agent.title}</span></p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'select' && (
            <div>
              <p className="text-slate-700 mb-6">
                Selecciona el proveedor de automatización que quieres usar para este agente:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PROVIDERS.map((provider) => {
                  const Icon = provider.icon;
                  return (
                    <button
                      key={provider.id}
                      onClick={() => handleProviderSelect(provider.id)}
                      className={`group relative p-6 border-2 ${provider.borderColor} ${provider.bgColor} rounded-xl hover:shadow-lg transition-all duration-200 hover:scale-105 text-left`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 ${provider.color} ${provider.bgColor} rounded-lg`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className={`text-lg font-bold ${provider.color} mb-1`}>
                            {provider.name}
                          </h3>
                          <p className="text-sm text-slate-600 leading-relaxed">
                            {provider.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <ExternalLink className="w-3 h-3" />
                        <span>Ver documentación</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 'configure' && selectedProviderData && (
            <div>
              <button
                onClick={handleBack}
                className="mb-4 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
              >
                ← Volver a selección
              </button>

              <div className={`p-6 ${selectedProviderData.bgColor} ${selectedProviderData.borderColor} border-2 rounded-xl mb-6`}>
                <div className="flex items-center gap-3 mb-3">
                  {React.createElement(selectedProviderData.icon, { className: `w-6 h-6 ${selectedProviderData.color}` })}
                  <h3 className={`text-xl font-bold ${selectedProviderData.color}`}>
                    {selectedProviderData.name}
                  </h3>
                </div>
                <p className="text-sm text-slate-700">
                  {selectedProviderData.description}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Webhook URL
                  </label>
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder={`https://hook.${selectedProvider === 'make' ? 'eu2.make.com' : selectedProvider === 'n8n' ? 'app.n8n.cloud' : 'api.openai.com'}/...`}
                    className="w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm font-mono"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    Pega aquí la URL del webhook que has configurado en {selectedProviderData.name}
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 mb-2 flex items-center gap-2">
                    <ExternalLink className="w-4 h-4" />
                    ¿Cómo obtener el webhook?
                  </h4>
                  <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                    {selectedProvider === 'make' && (
                      <>
                        <li>Ve a Make.com y crea un nuevo scenario</li>
                        <li>Añade un módulo "Webhook" como trigger</li>
                        <li>Copia la URL generada y pégala aquí</li>
                      </>
                    )}
                    {selectedProvider === 'n8n' && (
                      <>
                        <li>Ve a tu instancia de n8n y crea un workflow</li>
                        <li>Añade un nodo "Webhook" como trigger</li>
                        <li>Activa el workflow y copia la URL</li>
                      </>
                    )}
                    {selectedProvider === 'chatgpt' && (
                      <>
                        <li>Ve a OpenAI Platform y crea una Custom Action</li>
                        <li>Configura tu endpoint API</li>
                        <li>Copia la URL de tu API y pégala aquí</li>
                      </>
                    )}
                    {selectedProvider === 'zapier' && (
                      <>
                        <li>Ve a Zapier y crea un nuevo Zap</li>
                        <li>Selecciona "Webhooks by Zapier" como trigger</li>
                        <li>Copia la URL del webhook y pégala aquí</li>
                      </>
                    )}
                  </ol>
                  <a
                    href={selectedProviderData.docs}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    Ver documentación completa
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step === 'configure' && (
          <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between rounded-b-2xl">
            <button
              onClick={handleBack}
              className="px-4 py-2 text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConnect}
              disabled={!webhookUrl.trim()}
              className={`px-6 py-2.5 rounded-lg font-semibold flex items-center gap-2 transition-all ${webhookUrl.trim()
                ? 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
            >
              <Check className="w-4 h-4" />
              Conectar Agente
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

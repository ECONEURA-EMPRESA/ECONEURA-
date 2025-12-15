import React, { useState, useEffect, useMemo } from 'react';
import { API_URL } from '../config/api';
import { X, MessageSquare, Trash2, Clock, Zap, Search } from 'lucide-react';

interface Chat {
  id: number;
  neura_id: string;
  input: string;
  output: string;
  model: string;
  tokens_used?: number;
  duration_ms: number;
  created_at: string;
}

interface ChatHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  onSelectChat: (chat: any) => void;
  token?: string;
}

export function ChatHistory({ isOpen, onClose, token }: ChatHistoryProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadChats();
    }
  }, [isOpen]);

  const loadChats = async () => {
    setLoading(true);
    setError('');

    try {
      // ✅ Corregir endpoint: usar /api/conversations en lugar de /api/chats
      const response = await fetch(`${API_URL}/api/conversations?limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load chat history');
      }

      const data = await response.json();
      setChats(data.chats || []);
      setTotal(data.total || 0);

    } catch (err: any) {
      setError(err.message || 'Error loading history');
    } finally {
      setLoading(false);
    }
  };

  const deleteChat = async (chatId: number) => {
    if (!confirm('¿Eliminar este chat?')) return;

    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocalhost ? 'http://localhost:3000' : 'https://econeura-backend-production.azurewebsites.net';

      const response = await fetch(`${apiUrl}/api/chats/${chatId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete chat');
      }

      // Recargar lista
      loadChats();
      if (selectedChat?.id === chatId) {
        setSelectedChat(null);
      }

    } catch (err: any) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getNEURAName = (neuraId: string) => {
    const map: Record<string, string> = {
      'a-ceo-01': 'NEURA-CEO',
      'a-cfo-01': 'NEURA-CFO',
      'a-cto-01': 'NEURA-CTO',
      'a-mkt-01': 'NEURA-MKT',
      'a-chro-01': 'NEURA-CHRO',
      'a-cso-01': 'NEURA-CSO',
      'a-coo-01': 'NEURA-COO',
      'a-ciso-01': 'NEURA-CISO',
      'a-cdo-01': 'NEURA-CDO',
      'a-ia-01': 'NEURA-IA'
    };
    return map[neuraId] || neuraId;
  };

  // Filtrar chats por búsqueda
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter(chat =>
      chat.input.toLowerCase().includes(query) ||
      chat.output.toLowerCase().includes(query) ||
      getNEURAName(chat.neura_id).toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Historial de Chats</h2>
              <p className="text-sm text-gray-600">{total} conversaciones guardadas</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Search Bar */}
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar en conversaciones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            {searchQuery && (
              <p className="text-xs text-gray-500 mt-2">
                {filteredChats.length} resultado{filteredChats.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          <div className="flex-1 overflow-hidden flex">
            {/* Lista de chats */}
            <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="p-6 text-center text-red-600">
                  <p>{error}</p>
                  <button
                    onClick={loadChats}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Reintentar
                  </button>
                </div>
              ) : chats.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No hay chats guardados</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredChats.map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => setSelectedChat(chat)}
                      className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                        }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {getNEURAName(chat.neura_id)}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="p-1 hover:bg-red-100 rounded transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                        {chat.input}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(chat.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {formatDuration(chat.duration_ms)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Detalle del chat */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedChat ? (
                <div className="space-y-6">
                  {/* Info */}
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">NEURA:</span>
                      <span className="text-sm font-bold text-blue-600">
                        {getNEURAName(selectedChat.neura_id)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">Fecha:</span>
                      <span className="text-sm text-gray-700">
                        {formatDate(selectedChat.created_at)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">Duración:</span>
                      <span className="text-sm text-gray-700">
                        {formatDuration(selectedChat.duration_ms)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-600">Modelo:</span>
                      <span className="text-sm text-gray-700">{selectedChat.model}</span>
                    </div>
                    {selectedChat.tokens_used && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">Tokens:</span>
                        <span className="text-sm text-gray-700">{selectedChat.tokens_used}</span>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Tu pregunta:</h3>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedChat.input}</p>
                    </div>
                  </div>

                  {/* Output */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-2">Respuesta:</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-800 whitespace-pre-wrap">{selectedChat.output}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <p>Selecciona un chat para ver detalles</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


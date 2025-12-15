import React, { useState, useEffect } from 'react';
import { Upload, FileText, Search, X, Book, Sparkles, Loader } from 'lucide-react';
import { cx } from '../utils/classnames';
import { toast } from 'sonner';

interface Document {
  id: string;
  original_name: string;
  mime_type: string;
  size_bytes: number;
  department: string;
  neura: string;
  created_at: string;
}

interface LibraryPanelProps {
  darkMode: boolean;
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export function LibraryPanel({ darkMode, isOpen, onClose }: LibraryPanelProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ingesting, setIngesting] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');

  // Fetch documentos
  useEffect(() => {
    if (isOpen) {
      fetchDocuments();
    }
  }, [isOpen, selectedDept]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDept !== 'ALL') params.set('department', selectedDept);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/library?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('econeura_token') || ''}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
      } else {
        setDocuments([]);
      }
    } catch (e: any) {
      const errorMsg = e.message || 'Error de conexión. Verifica tu internet.';
      if (errorMsg.includes('Sesión expirada')) {
        toast.error(errorMsg);
      } else {
        console.error('Library fetch error:', e);
        setDocuments([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500 * 1024 * 1024) {
      toast.error('Archivo demasiado grande (máx. 500MB)');
      return;
    }

    if (!file.type.includes('pdf')) {
      toast.error('Solo PDFs soportados actualmente');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('department', selectedDept !== 'ALL' ? selectedDept : 'GENERAL');
      formData.append('neura', 'GENERAL');

      const res = await fetch('/api/library/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('econeura_token') || ''}`
        },
        body: formData
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (res.status === 413) {
          throw new Error('Archivo demasiado grande. Máximo 500MB.');
        } else if (res.status === 500) {
          throw new Error('Error del servidor. Inténtalo más tarde.');
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        toast.success(`Documento "${file.name}" subido correctamente`);
        fetchDocuments();
        e.target.value = '';
      } else {
        toast.error(data.error || 'Error al subir documento');
      }
    } catch (e: any) {
      const errorMsg = e.message || 'Error de conexión. Verifica tu internet.';
      toast.error(errorMsg);
      console.error('Library upload error:', e);
    } finally {
      setUploading(false);
    }
  };

  const handleIngest = async (docId: string) => {
    try {
      setIngesting(docId);
      const res = await fetch(`/api/library/ingest/${docId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('econeura_token') || ''}`
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
        } else if (res.status === 404) {
          throw new Error('Documento no encontrado.');
        } else if (res.status === 500) {
          throw new Error('Error del servidor. Inténtalo más tarde.');
        }
        throw new Error(`Error ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.success) {
        toast.success(`Documento ingerido: ${data.chunks} chunks, ${data.pages} páginas`);
        fetchDocuments();
      } else {
        toast.error(data.error || 'Error al ingerir documento');
      }
    } catch (e: any) {
      const errorMsg = e.message || 'Error de conexión. Verifica tu internet.';
      toast.error(errorMsg);
      console.error('Library ingest error:', e);
    } finally {
      setIngesting(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 md:inset-4 bg-black/50 backdrop-blur-sm z-[999] flex items-center justify-center p-2 md:p-4">
      <div className={cx(
        "w-full h-full md:max-w-4xl md:max-h-[85vh] rounded-none md:rounded-3xl shadow-2xl flex flex-col overflow-hidden",
        darkMode ? 'bg-[#0d1117]' : 'bg-gradient-to-b from-slate-50 via-white to-slate-50'
      )}>
        {/* Header */}
        <div className={cx(
          "flex justify-between items-center p-4 md:p-6 border-b",
          darkMode ? 'border-slate-800 bg-[#161b22]' : 'border-slate-200/60 bg-white/80'
        )}>
          <div className="flex items-center gap-3">
            <div className={cx(
              "p-2 rounded-xl",
              darkMode ? 'bg-blue-500/20' : 'bg-blue-500/10'
            )}>
              <Book className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className={cx(
                "text-lg md:text-xl font-bold",
                darkMode ? 'text-slate-100' : 'text-slate-900'
              )}>
                NEURA Library
              </h3>
              <p className={cx(
                "text-xs md:text-sm",
                darkMode ? 'text-slate-400' : 'text-slate-600'
              )}>
                Base de conocimientos empresariales
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={cx(
              "p-2 rounded-lg transition-colors",
              darkMode
                ? 'hover:bg-slate-700 text-slate-400 hover:text-slate-200'
                : 'hover:bg-slate-100 text-slate-500 hover:text-slate-700'
            )}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Upload Zone */}
          <div className={cx(
            "border-2 border-dashed rounded-2xl p-6 mb-6 text-center transition-all",
            darkMode
              ? 'border-slate-700 hover:border-blue-500/50 bg-slate-900/50'
              : 'border-slate-300 hover:border-blue-400 bg-blue-50/30'
          )}>
            <Upload className={cx("w-12 h-12 mx-auto mb-3", darkMode ? 'text-blue-400' : 'text-blue-500')} />
            <p className={cx(
              "text-sm font-medium mb-2",
              darkMode ? 'text-slate-300' : 'text-slate-700'
            )}>
              Subir documento PDF
            </p>
            <p className={cx(
              "text-xs mb-4",
              darkMode ? 'text-slate-500' : 'text-slate-600'
            )}>
              Máximo 500MB
            </p>
            <label className={cx(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-colors",
              darkMode
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            )}>
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Seleccionar archivo
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handleUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          </div>

          {/* Filter & Search */}
          <div className="flex gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className={cx(
                "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
                darkMode ? 'text-slate-500' : 'text-slate-400'
              )} />
              <input
                type="text"
                placeholder="Buscar documentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchDocuments()}
                className={cx(
                  "w-full pl-10 pr-4 py-2 rounded-lg border transition-colors",
                  darkMode
                    ? 'bg-slate-900 border-slate-700 text-slate-100 placeholder-slate-500'
                    : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                )}
              />
            </div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className={cx(
                "px-4 py-2 rounded-lg border transition-colors",
                darkMode
                  ? 'bg-slate-900 border-slate-700 text-slate-100'
                  : 'bg-white border-slate-300 text-slate-900'
              )}
            >
              <option value="ALL">Todos</option>
              <option value="CEO">CEO</option>
              <option value="CFO">CFO</option>
              <option value="CTO">CTO</option>
              <option value="CMO">CMO</option>
              <option value="COO">COO</option>
            </select>
          </div>

          {/* Documents List */}
          {loading ? (
            <div className="text-center py-12">
              <Loader className={cx("w-8 h-8 mx-auto animate-spin", darkMode ? 'text-slate-600' : 'text-slate-400')} />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className={cx("w-16 h-16 mx-auto mb-4", darkMode ? 'text-slate-700' : 'text-slate-300')} />
              <p className={cx(
                "text-lg font-medium mb-2",
                darkMode ? 'text-slate-400' : 'text-slate-600'
              )}>
                Sin documentos
              </p>
              <p className={cx("text-sm", darkMode ? 'text-slate-600' : 'text-slate-500')}>
                Sube tu primer PDF para comenzar
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={cx(
                    "p-4 rounded-xl border transition-all",
                    darkMode
                      ? 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cx(
                      "p-3 rounded-lg flex-shrink-0",
                      darkMode ? 'bg-blue-500/20' : 'bg-blue-50'
                    )}>
                      <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className={cx(
                        "font-semibold mb-1 truncate",
                        darkMode ? 'text-slate-100' : 'text-slate-900'
                      )}>
                        {doc.original_name}
                      </h4>
                      <div className="flex items-center gap-4 text-xs">
                        <span className={cx(darkMode ? 'text-slate-500' : 'text-slate-600')}>
                          {(doc.size_bytes / 1024).toFixed(1)} KB
                        </span>
                        <span className={cx(
                          "px-2 py-0.5 rounded-full",
                          darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'
                        )}>
                          {doc.department}
                        </span>
                        <span className={cx(darkMode ? 'text-slate-500' : 'text-slate-600')}>
                          {new Date(doc.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleIngest(doc.id)}
                      disabled={ingesting === doc.id}
                      className={cx(
                        "px-4 py-2 rounded-lg transition-colors flex items-center gap-2",
                        ingesting === doc.id
                          ? 'bg-blue-400 cursor-not-allowed'
                          : darkMode
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                      )}
                    >
                      {ingesting === doc.id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Ingiriendo...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Ingerir
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


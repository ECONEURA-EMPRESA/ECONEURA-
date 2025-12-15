/**
 * ECONEURA - Knowledge Domain: Document Aggregate
 * Modelo de dominio para documentos en el sistema RAG
 */
export interface Document {
  id: string;
  tenantId: string | null;
  userId: string;
  department: string;
  neura: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storageProvider: 'azure-blob' | 'local';
  storagePath: string;
  status: 'uploaded' | 'processing' | 'ingested' | 'failed';
  chunksCount: number;
  pagesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  department: string;
  neura: string;
  pageFrom: number;
  pageTo: number;
  text: string;
  embedding?: number[]; // Para búsqueda vectorial futura
  createdAt: Date;
}

export interface DocumentSearchResult {
  chunkId: string;
  documentId: string;
  documentName: string;
  pages: string; // "1-2"
  preview: string;
  relevanceScore?: number;
}


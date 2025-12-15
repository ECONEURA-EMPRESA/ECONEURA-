/**
 * ECONEURA - Library API Routes (RAG)
 * Gestión de documentos para RAG (Retrieval Augmented Generation)
 * Migrado desde ECONEURA-REMOTE/backend/api/library.js
 * 
 * INTEGRADO: Usa casos de uso del dominio knowledge/
 */
import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { sendResult } from '../httpResult';
import { logger } from '../../../shared/logger';
import type { RequestWithId } from '../../http/middleware/requestId';
import { libraryUploadLimiter } from '../middleware/rateLimiter';
import { uploadDocument } from '../../../knowledge/application/uploadDocument';
import { ingestDocument } from '../../../knowledge/application/ingestDocument';
import { searchDocuments } from '../../../knowledge/application/searchDocuments';
import {
  documentStore,
  documentChunkStore,
  documentProcessor,
  storageService
} from '../../../knowledge/infra/knowledgeServiceFactory';

const router = Router();

// Schemas de validación
const uploadDocumentSchema = z.object({
  department: z.string().default('GENERAL'),
  neura: z.string().default('GENERAL')
});

const searchLibrarySchema = z.object({
  q: z.string().min(2),
  department: z.string().optional(),
  neura: z.string().optional(),
  topK: z.coerce.number().int().min(1).max(50).default(5)
});

/**
 * POST /api/library/upload
 * Subir documento para RAG
 * 
 * INTEGRADO: Usa uploadDocument() del dominio knowledge/
 * NOTA: Para producción, implementar multer para manejo de multipart/form-data
 */
router.post('/upload', libraryUploadLimiter, async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const parsed = uploadDocumentSchema.parse(req.body);

    // Obtener userId del contexto de autenticación
    const userId = req.authContext?.userId ?? 'anonymous';
    const tenantId = req.authContext?.tenantId ?? null;

    // Por ahora, simulamos un archivo desde el body
    // En producción, esto vendría de multer
    const fileBuffer = req.body.fileBuffer
      ? Buffer.from(req.body.fileBuffer, 'base64')
      : Buffer.from('stub file content');

    const uploadResult = await uploadDocument(
      {
        userId,
        tenantId,
        file: {
          buffer: fileBuffer,
          originalName: req.body.originalName ?? `document-${Date.now()}.pdf`,
          mimeType: req.body.mimeType ?? 'application/pdf',
          sizeBytes: fileBuffer.length
        },
        department: parsed.department,
        neura: parsed.neura
      },
      {
        documentStore,
        storageService
      }
    );

    if (!uploadResult.success) {
      logger.error('[Library API] Error en uploadDocument', {
        error: uploadResult.error.message,
        requestId: reqWithId.id
      });
      return sendResult(res, uploadResult, 201, 400);
    }

    logger.info('[Library API] Documento subido correctamente', {
      documentId: uploadResult.data.id,
      department: parsed.department,
      neura: parsed.neura,
      requestId: reqWithId.id
    });

    return res.status(201).json({
      success: true,
      correlationId: reqWithId.id,
      document: {
        id: uploadResult.data.id,
        department: uploadResult.data.department,
        neura: uploadResult.data.neura,
        originalName: uploadResult.data.originalName,
        status: uploadResult.data.status,
        created_at: uploadResult.data.createdAt.toISOString()
      }
    });
  } catch (error) {
    const reqWithId = req as RequestWithId;
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Datos inválidos',
        details: error.issues,
        correlationId: reqWithId.id
      });
    }

    logger.error('[Library API] Error subiendo documento', {
      error: error instanceof Error ? error.message : String(error),
      requestId: reqWithId.id
    });
    return res.status(500).json({
      success: false,
      error: 'Error subiendo documento',
      correlationId: reqWithId.id
    });
  }
});

/**
 * GET /api/library
 * Listar documentos del usuario
 * 
 * INTEGRADO: Usa documentStore.listByUser() del dominio knowledge/
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const userId = req.authContext?.userId ?? 'anonymous';
    const { department, neura, q } = req.query;

    const listResult = await documentStore.listByUser(userId, {
      ...(typeof department === 'string' ? { department } : {}),
      ...(typeof neura === 'string' ? { neura } : {}),
      ...(typeof q === 'string' ? { q } : {})
    });

    if (!listResult.success) {
      logger.error('[Library API] Error listando documentos', {
        error: listResult.error.message,
        requestId: reqWithId.id
      });
      return sendResult(res, listResult, 200, 500);
    }

    logger.info('[Library API] Documentos listados', {
      total: listResult.data.length,
      department,
      neura,
      requestId: reqWithId.id
    });

    return res.json({
      success: true,
      total: listResult.data.length,
      documents: listResult.data.map((doc) => ({
        id: doc.id,
        originalName: doc.originalName,
        department: doc.department,
        neura: doc.neura,
        status: doc.status,
        chunksCount: doc.chunksCount,
        pagesCount: doc.pagesCount,
        createdAt: doc.createdAt.toISOString()
      }))
    });
  } catch (error) {
    logger.error('[Library API] Error listando documentos', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error listando documentos'
    });
  }
});

/**
 * GET /api/library/search
 * Buscar en documentos (RAG search)
 * 
 * INTEGRADO: Usa searchDocuments() del dominio knowledge/
 */
router.get('/search', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const userId = req.authContext?.userId ?? 'anonymous';
    const parsed = searchLibrarySchema.parse(req.query);

    const searchResult = await searchDocuments(
      {
        query: parsed.q,
        userId,
        ...(parsed.department ? { department: parsed.department } : {}),
        ...(parsed.neura ? { neura: parsed.neura } : {}),
        topK: parsed.topK
      },
      { documentChunkStore }
    );

    if (!searchResult.success) {
      logger.error('[Library API] Error en searchDocuments', {
        error: searchResult.error.message,
        requestId: reqWithId.id
      });
      return sendResult(res, searchResult, 200, 400);
    }

    logger.info('[Library API] Búsqueda completada', {
      query: parsed.q,
      results: searchResult.data.length,
      requestId: reqWithId.id
    });

    return res.json({
      success: true,
      total: searchResult.data.length,
      snippets: searchResult.data
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: 'Parámetros inválidos',
        details: error.issues
      });
    }

    logger.error('[Library API] Error buscando en biblioteca', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error buscando en biblioteca'
    });
  }
});

/**
 * GET /api/library/:id/download
 * Descargar documento
 */
router.get('/:id/download', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const { id } = req.params;

    // Por ahora, retornamos 404
    // En el futuro, esto descargará desde Azure Blob Storage
    logger.info('[Library API] Descargando documento (stub)', {
      documentId: id,
      requestId: reqWithId.id
    });

    return res.status(404).json({
      success: false,
      error: 'Documento no encontrado (stub)'
    });
  } catch (error) {
    logger.error('[Library API] Error descargando documento', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error descargando documento'
    });
  }
});

/**
 * DELETE /api/library/:id
 * Eliminar documento
 * 
 * INTEGRADO: Usa documentStore.delete() del dominio knowledge/
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const userId = req.authContext?.userId ?? 'anonymous';
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required'
      });
    }

    const deleteResult = await documentStore.delete(id, userId);

    if (!deleteResult.success) {
      logger.error('[Library API] Error eliminando documento', {
        error: deleteResult.error.message,
        documentId: id,
        requestId: reqWithId.id
      });
      return sendResult(res, deleteResult, 200, 404);
    }

    logger.info('[Library API] Documento eliminado', {
      documentId: id,
      requestId: reqWithId.id
    });

    return res.json({
      success: true,
      message: 'Documento eliminado correctamente'
    });
  } catch (error) {
    logger.error('[Library API] Error eliminando documento', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error eliminando documento'
    });
  }
});

/**
 * POST /api/library/ingest/:id
 * Ingerir documento (extraer texto para RAG)
 * 
 * INTEGRADO: Usa ingestDocument() del dominio knowledge/
 */
router.post('/ingest/:id', async (req: Request, res: Response) => {
  try {
    const reqWithId = req as RequestWithId;
    const userId = req.authContext?.userId ?? 'anonymous';
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Document ID is required',
        correlationId: reqWithId.id
      });
    }

    const ingestResult = await ingestDocument(
      {
        documentId: id,
        userId
      },
      {
        documentStore,
        documentChunkStore,
        documentProcessor,
        storageService
      }
    );

    if (!ingestResult.success) {
      logger.error('[Library API] Error en ingestDocument', {
        error: ingestResult.error.message,
        documentId: id,
        requestId: reqWithId.id
      });
      return sendResult(res, ingestResult, 200, 404);
    }

    logger.info('[Library API] Documento ingerido correctamente', {
      documentId: id,
      chunks: ingestResult.data.chunks,
      pages: ingestResult.data.pages,
      requestId: reqWithId.id
    });

    return res.json({
      success: true,
      correlationId: reqWithId.id,
      chunks: ingestResult.data.chunks,
      pages: ingestResult.data.pages,
      document: { id }
    });
  } catch (error) {
    logger.error('[Library API] Error ingiriendo documento', {
      error: error instanceof Error ? error.message : String(error),
      requestId: (req as RequestWithId).id
    });
    return res.status(500).json({
      success: false,
      error: 'Error ingiriendo documento',
      correlationId: (req as RequestWithId).id
    });
  }
});

export const libraryRoutes = router;


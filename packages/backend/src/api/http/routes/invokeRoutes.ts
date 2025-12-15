/**
 * ECONEURA - Invoke Routes
 * Endpoint compatible con el frontend para invocar agentes NEURA
 * Mapea agentId del frontend (ej: a-ceo-01) a neuraId del backend (ej: neura-ceo)
 */
import { Router } from 'express';
// import { sendNeuraMessage } from '../../../conversation/sendNeuraMessage';
import { requireRoles } from '../middleware/rbacMiddleware';
import type { NeuraId } from '../../../shared/types';
import { logger } from '../../../shared/logger';
import { logError, resultToHttpError } from '../../../shared/utils/errorUtils';
import fs from 'fs';
import path from 'path';
import { getValidatedEnv } from '../../../config/env';

const router = Router();
const uploadsDir = path.join(process.cwd(), 'uploads');

/**
 * Mapeo de agentId del frontend a neuraId del backend
 */
const agentIdToNeuraId: Record<string, NeuraId> = {
  // ✅ MAPEO CORREGIDO: Coincide con agentIds del frontend
  'a-ceo-01': 'neura-ceo',
  'a-ia-01': 'neura-cto',        // IA -> CTO (tecnología)
  'a-cso-01': 'neura-ventas',    // CSO -> Ventas
  'a-cto-01': 'neura-cto',       // CTO -> CTO
  'a-ciso-01': 'neura-legal',    // CISO -> Legal (seguridad/compliance)
  // Mapeo para atención al cliente (puede usar cualquier agente de soporte)
  'a-support-01': 'neura-atencion-cliente', 'a-support-02': 'neura-atencion-cliente',
  'a-coo-01': 'neura-operaciones', // COO -> Operaciones
  'a-chro-01': 'neura-rrhh',     // CHRO -> RRHH
  'a-mkt-01': 'neura-cmo',       // Marketing -> CMO
  'a-cfo-01': 'neura-cfo',       // CFO -> CFO
  'a-cdo-01': 'neura-datos',     // CDO -> Datos
  // Mapeo adicional para todos los agentes de cada departamento
  'a-ceo-02': 'neura-ceo', 'a-ceo-03': 'neura-ceo', 'a-ceo-04': 'neura-ceo',
  'a-ia-02': 'neura-cto', 'a-ia-03': 'neura-cto', 'a-ia-04': 'neura-cto',
  'a-cso-02': 'neura-ventas', 'a-cso-03': 'neura-ventas', 'a-cso-04': 'neura-ventas',
  'a-cto-02': 'neura-cto', 'a-cto-03': 'neura-cto', 'a-cto-04': 'neura-cto',
  'a-ciso-02': 'neura-legal', 'a-ciso-03': 'neura-legal', 'a-ciso-04': 'neura-legal',
  'a-coo-02': 'neura-operaciones', 'a-coo-03': 'neura-operaciones', 'a-coo-04': 'neura-operaciones',
  'a-chro-02': 'neura-rrhh', 'a-chro-03': 'neura-rrhh', 'a-chro-04': 'neura-rrhh',
  'a-mkt-02': 'neura-cmo', 'a-mkt-03': 'neura-cmo', 'a-mkt-04': 'neura-cmo',
  'a-cfo-02': 'neura-cfo', 'a-cfo-03': 'neura-cfo', 'a-cfo-04': 'neura-cfo',
  'a-cdo-02': 'neura-datos', 'a-cdo-03': 'neura-datos', 'a-cdo-04': 'neura-datos',
  // Mapeo para NEURA Innovación (si hay agentes de innovación en el futuro)
  'a-innovacion-01': 'neura-innovacion', 'a-innovacion-02': 'neura-innovacion',
  'a-innovacion-03': 'neura-innovacion', 'a-innovacion-04': 'neura-innovacion',
  // Aliases legacy (por compatibilidad - solo los que no están duplicados)
  'a-ventas-01': 'neura-ventas',
  'a-atencion-cliente-01': 'neura-atencion-cliente',
  'a-rrhh-01': 'neura-rrhh',
  'a-operaciones-01': 'neura-operaciones',
  'a-legal-01': 'neura-legal',
  'a-datos-01': 'neura-datos'
};

/**
 * POST /api/invoke/:agentId
 * Invocar un agente NEURA usando el ID del frontend
 */
router.post('/api/invoke/:agentId', requireRoles('admin', 'user'), async (req, res) => {
  const { agentId } = req.params;
  const authContext = req.authContext;

  // Validar agentId
  if (!agentId || typeof agentId !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'agentId es requerido'
    });
  }

  // Mapear agentId a neuraId
  const neuraId = agentIdToNeuraId[agentId];
  if (!neuraId) {
    logger.warn('[Invoke API] AgentId no encontrado', { agentId });
    return res.status(404).json({
      success: false,
      error: `AgentId no encontrado: ${agentId}`,
      availableAgents: Object.keys(agentIdToNeuraId)
    });
  }

  // Obtener input del body (soporta texto, imagen, archivo, voz)
  const {
    input,
    image,
    file,
    audio,
    conversationId,
    correlationId,
    attachmentUrl,
    attachmentType,
    attachmentName,
    attachmentMimeType,
    // attachmentSize,
    attachmentId
  } = req.body as {
    input?: string;
    image?: string; // base64
    file?: string; // base64 o URL
    audio?: string; // base64
    conversationId?: string;
    correlationId?: string;
    attachmentUrl?: string;
    attachmentType?: 'image' | 'file';
    attachmentName?: string;
    attachmentMimeType?: string;
    attachmentSize?: number;
    attachmentId?: string;
  };

  // ✅ SIN RESTRICCIONES: Permitir cualquier input (texto, imagen, archivo, audio, o combinación)
  // No validar - dejar que el LLM maneje lo que pueda
  let processedMessage = input?.trim() || '';

  if (!input && !image && !file && !audio && !attachmentUrl && !attachmentId) {
    // Solo si NO hay nada, sugerir texto por defecto
    processedMessage = 'Hola, ¿en qué puedo ayudarte?';
  }
  let imageBase64: string | undefined = undefined;
  let fileContent: string | undefined = undefined;

  if (image) {
    // La imagen ya viene en base64 desde el frontend
    imageBase64 = image.includes(',') ? image.split(',')[1] : image;
    processedMessage = processedMessage || 'Analiza esta imagen en detalle y proporciona toda la información relevante que puedas extraer.';
  }

  const resolveAttachmentPath = (id?: string): string | null => {
    if (!id) return null;
    const candidate = path.join(uploadsDir, id);
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    return null;
  };

  if (attachmentType && (attachmentUrl || attachmentId)) {
    if (attachmentType === 'image') {
      const filePath = resolveAttachmentPath(attachmentId || attachmentName);
      if (filePath) {
        try {
          const buffer = fs.readFileSync(filePath);
          imageBase64 = buffer.toString('base64');
          processedMessage =
            processedMessage ||
            `Analiza esta imagen (${attachmentName ?? 'sin nombre'}) y proporciona información relevante.`;
        } catch (error) {
          logger.error('[Invoke API] Error leyendo imagen adjunta', {
            error: error instanceof Error ? error.message : String(error)
          });
        }
      } else if (attachmentUrl) {
        // ✅ CORRECCIÓN: Intentar descargar la imagen desde la URL (local o remota)
        try {
          // Si es una URL local (uploads), construir la ruta completa
          let urlToFetch = attachmentUrl;
          if (attachmentUrl.startsWith('/uploads/') || attachmentUrl.includes('localhost:3000/uploads')) {
            const env = getValidatedEnv();
            const baseUrl = env.PUBLIC_UPLOAD_BASE_URL ?? 'http://localhost:3000';
            const fileName = attachmentUrl.split('/').pop() || attachmentId || attachmentName;
            urlToFetch = `${baseUrl}/uploads/${fileName}`;
          }

          // ✅ CORRECCIÓN: Usar fs.readFileSync para URLs locales en lugar de fetch
          if (urlToFetch.includes('localhost:3000/uploads') || urlToFetch.startsWith('/uploads/')) {
            const fileName = urlToFetch.split('/').pop() || attachmentId || attachmentName || 'temp_file';
            const filePath = path.join(uploadsDir, fileName);
            if (fs.existsSync(filePath)) {
              const buffer = fs.readFileSync(filePath);
              imageBase64 = buffer.toString('base64');
              processedMessage =
                processedMessage ||
                `Analiza esta imagen (${attachmentName ?? 'adjunta'}) y proporciona información relevante.`;
              logger.info('[Invoke API] Imagen leída correctamente desde archivo local', {
                filePath,
                size: buffer.length
              });
            } else {
              logger.warn('[Invoke API] Archivo no encontrado localmente', { filePath });
              processedMessage =
                processedMessage ||
                `Analiza esta imagen disponible en el siguiente enlace: ${attachmentUrl}`;
            }
          } else {
            // Para URLs remotas, usar fetch (Node.js 18+ tiene fetch nativo)
            const urlResponse = await fetch(urlToFetch);
            if (urlResponse.ok) {
              const arrayBuffer = await urlResponse.arrayBuffer();
              const buffer = Buffer.from(arrayBuffer);
              imageBase64 = buffer.toString('base64');
              processedMessage =
                processedMessage ||
                `Analiza esta imagen (${attachmentName ?? 'adjunta'}) y proporciona información relevante.`;
              logger.info('[Invoke API] Imagen descargada correctamente desde URL remota', {
                url: urlToFetch,
                size: buffer.length
              });
            } else {
              logger.warn('[Invoke API] No se pudo descargar imagen desde URL', {
                url: urlToFetch,
                status: urlResponse.status
              });
              processedMessage =
                processedMessage ||
                `Analiza esta imagen disponible en el siguiente enlace: ${attachmentUrl}`;
            }
          }
        } catch (error) {
          logger.error('[Invoke API] Error descargando imagen desde URL', {
            error: error instanceof Error ? error.message : String(error),
            url: attachmentUrl
          });
          processedMessage =
            processedMessage ||
            `Analiza esta imagen disponible en el siguiente enlace: ${attachmentUrl}`;
        }
      }
    } else if (attachmentType === 'file') {
      const filePath = resolveAttachmentPath(attachmentId || attachmentName);
      if (filePath) {
        try {
          const buffer = fs.readFileSync(filePath);
          const base64 = buffer.toString('base64');
          const { extractTextFromFile } = await import('../../../shared/utils/fileExtractor');
          const extractResult = await extractTextFromFile(
            base64,
            attachmentMimeType || 'application/octet-stream',
            attachmentName
          );

          if (extractResult.success) {
            const fileText = extractResult.data.text;
            processedMessage = processedMessage
              ? `${processedMessage}\n\n--- Contenido del archivo "${attachmentName || 'archivo'}": ---\n${fileText}`
              : `Analiza este archivo y proporciona información relevante:\n\n--- Contenido del archivo "${attachmentName || 'archivo'}": ---\n${fileText}`;
          } else {
            logger.warn('[Invoke API] Error extrayendo archivo adjunto', {
              error: extractResult.error.message
            });
            processedMessage =
              processedMessage ||
              'Error al procesar el archivo adjunto. Por favor, intenta con otro formato o revisa el contenido.';
          }
        } catch (error) {
          logger.error('[Invoke API] Error leyendo archivo adjunto', {
            error: error instanceof Error ? error.message : String(error)
          });
          processedMessage =
            processedMessage ||
            'Error interno al procesar el archivo adjunto. Por favor, intenta nuevamente.';
        }
      } else if (attachmentUrl) {
        processedMessage =
          processedMessage ||
          `Analiza el archivo disponible en el siguiente enlace (puede requerir acceso público): ${attachmentUrl}`;
      }
    }
  }

  if (file) {
    // ✅ SOLUCIÓN COMPLETA: Extraer texto de CUALQUIER tipo de archivo
    try {
      const { extractTextFromFile } = await import('../../../shared/utils/fileExtractor');
      const mimeType = req.body.mimeType || req.body.attachmentMimeType || 'application/octet-stream';
      const fileName = req.body.fileName || req.body.attachmentName || 'archivo';

      const extractResult = await extractTextFromFile(file, mimeType, fileName);

      if (extractResult.success) {
        // Agregar el texto extraído al mensaje con contexto completo
        const fileText = extractResult.data.text;
        processedMessage = processedMessage
          ? `${processedMessage}\n\n--- CONTENIDO COMPLETO DEL ARCHIVO "${extractResult.data.fileName || fileName}" (${mimeType}): ---\n\n${fileText}\n\n--- FIN DEL ARCHIVO ---\n\nAnaliza este contenido en profundidad y proporciona toda la información relevante que puedas extraer.`
          : `Analiza este archivo en profundidad y proporciona toda la información relevante:\n\n--- CONTENIDO COMPLETO DEL ARCHIVO "${extractResult.data.fileName || fileName}" (${mimeType}): ---\n\n${fileText}\n\n--- FIN DEL ARCHIVO ---\n\nProporciona un análisis detallado y completo.`;
        fileContent = undefined; // Ya procesado, no enviar el base64
      } else {
        logger.warn('[Invoke API] Error extrayendo archivo, intentando enviar directamente', {
          error: extractResult.error.message,
          mimeType,
          fileName
        });
        // Si falla la extracción, intentar enviar el archivo directamente al LLM
        fileContent = file;
        processedMessage = processedMessage || `Analiza este archivo (${fileName}, ${mimeType}) y proporciona toda la información que puedas extraer.`;
      }
    } catch (e) {
      logger.error('[Invoke API] Excepción extrayendo archivo, enviando directamente', {
        error: e instanceof Error ? e.message : String(e)
      });
      // Si falla completamente, enviar el archivo directamente
      fileContent = file;
      processedMessage = processedMessage || 'Analiza este archivo y proporciona toda la información relevante.';
    }
  }

  if (audio) {
    // TODO: Implementar transcripción de audio
    processedMessage = processedMessage || 'Transcribe y analiza este audio.';
  }

  try {
    // Obtener información del agente para el modelo
    const { getNeuraById } = await import('../../../neura/neuraCatalog');
    const { getLLMAgent } = await import('../../../llm/llmAgentsRegistry');

    const neuraResult = getNeuraById(neuraId);
    if (!neuraResult.success) {
      return res.status(500).json({
        success: false,
        error: `Error obteniendo NEURA: ${neuraResult.error.message}`
      });
    }

    const agentResult = getLLMAgent(neuraResult.data.llmAgentId);
    const modelName = agentResult.success ? agentResult.data.model : 'mistral-medium';

    // Usar sendNeuraMessage con soporte para imágenes
    const { sendNeuraMessage } = await import('../../../conversation/sendNeuraMessage');

    const result = await sendNeuraMessage({
      neuraId,
      tenantId: authContext?.tenantId ?? null,
      conversationId: conversationId ?? undefined,
      message: processedMessage,
      userId: authContext?.userId ?? null,
      correlationId: correlationId ?? undefined,
      image: imageBase64,
      file: fileContent,
      attachmentUrl, // ✅ Agregar attachmentUrl
      attachmentType // ✅ Agregar attachmentType
    });

    if (!result.success) {
      // ✅ AUDITORÍA: Usar utilidad centralizada para logging de errores
      logError('[Invoke API] Error enviando mensaje a NEURA', result.error, {
        agentId,
        neuraId
      });
      const httpError = resultToHttpError(result, 500);
      return res.status(httpError.statusCode).json({
        success: false,
        error: httpError.message,
        code: httpError.code,
        details: httpError.details
      });
    }

    return res.status(200).json({
      success: true,
      output: result.data.neuraReply,
      message: result.data.neuraReply, // Alias para compatibilidad
      conversationId: result.data.conversationId,
      model: modelName, // Modelo real del agente
      tokens: 0, // ✅ AUDITORÍA: FUTURO - Obtener de la respuesta real del LLM
      cost: 0 // ✅ AUDITORÍA: FUTURO - Calcular costo real basado en modelo y tokens
    });
  } catch (e) {
    // ✅ AUDITORÍA: Usar utilidad centralizada para manejo de errores
    logError('[Invoke API] Excepción enviando mensaje', e, {
      agentId,
      neuraId
    });
    const httpError = resultToHttpError(
      { success: false, error: e instanceof Error ? e : new Error(String(e)) },
      500
    );
    return res.status(httpError.statusCode).json({
      success: false,
      error: httpError.message,
      code: httpError.code,
      details: process.env['NODE_ENV'] === 'development' ? httpError.details : undefined
    });
  }
});

export const invokeRoutes = router;


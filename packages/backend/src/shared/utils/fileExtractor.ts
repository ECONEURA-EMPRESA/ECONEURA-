/**
 * ECONEURA - File Extractor Utility
 * Extrae texto de archivos (PDF, DOC, DOCX, TXT, CSV) para análisis por el modelo
 */
import { logger } from '../logger';
import { ok, err, type Result } from '../Result';

export interface FileExtractionResult {
  text: string;
  fileName?: string;
  mimeType?: string;
}

export interface ExtractedFileContent {
  text: string;
  mimeType: string;
  fileName?: string;
  pageCount?: number;
}

/**
 * Extraer texto de un archivo base64
 */
export async function extractTextFromFile(
  fileBase64: string,
  mimeType: string,
  fileName?: string
): Promise<Result<FileExtractionResult, Error>> {
  try {
    // Convertir base64 a Buffer
    const base64Content = fileBase64.includes(',') ? fileBase64.split(',')[1] : fileBase64;
    if (!base64Content) {
      return err(new Error('Contenido base64 vacío'));
    }
    const buffer = Buffer.from(base64Content, 'base64');

    // Procesar según tipo MIME
    if (mimeType === 'application/pdf' || fileName?.endsWith('.pdf')) {
      return await extractFromPDF(buffer, mimeType, fileName);
    } else if (
      mimeType.includes('wordprocessingml') ||
      mimeType.includes('msword') ||
      fileName?.endsWith('.docx') ||
      fileName?.endsWith('.doc')
    ) {
      return await extractFromDOC(buffer, mimeType, fileName);
    } else if (mimeType === 'text/plain' || fileName?.endsWith('.txt')) {
      return ok({
        text: buffer.toString('utf-8'),
        mimeType,
        fileName
      });
    } else if (mimeType === 'text/csv' || fileName?.endsWith('.csv')) {
      return ok({
        text: buffer.toString('utf-8'),
        mimeType,
        fileName
      });
    } else {
      return err(new Error(`Tipo de archivo no soportado: ${mimeType}`));
    }
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    logger.error('[FileExtractor] Error extrayendo texto', {
      error: error.message,
      mimeType,
      fileName
    });
    return err(error);
  }
}

/**
 * Extraer texto de PDF (implementación básica)
 * ✅ AUDITORÍA: FUTURO - En producción usar pdf-parse o pdf.js para mejor extracción
 * Por ahora, extrae texto básico del PDF
 */
async function extractFromPDF(buffer: Buffer, mimeType: string, fileName?: string): Promise<Result<FileExtractionResult, Error>> {
  try {
    // Por ahora, intentar extraer texto básico del PDF
    // En producción, usar pdf-parse: npm install pdf-parse
    const text = buffer.toString('utf-8', 0, Math.min(10000, buffer.length));
    
    // Buscar texto legible en el PDF
    const readableText = text.match(/[a-zA-Z0-9\s]{20,}/g)?.join(' ') || '';
    
    if (readableText.length < 10) {
      return err(new Error('No se pudo extraer texto del PDF. Por favor, usa un PDF con texto seleccionable.'));
    }

    return ok({
      text: readableText.substring(0, 5000), // Limitar a 5000 caracteres
      mimeType: 'application/pdf',
      fileName
    });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    return err(new Error(`Error extrayendo PDF: ${error.message}`));
  }
}

/**
 * Extraer texto de DOC/DOCX (implementación básica)
 * ✅ AUDITORÍA: FUTURO - En producción usar mammoth para DOCX para mejor extracción
 * Por ahora, extrae texto básico del documento
 */
async function extractFromDOC(buffer: Buffer, mimeType: string, fileName?: string): Promise<Result<FileExtractionResult, Error>> {
  try {
    // Por ahora, intentar extraer texto básico
    // En producción, usar mammoth: npm install mammoth
    const text = buffer.toString('utf-8', 0, Math.min(10000, buffer.length));
    
    // Buscar texto legible
    const readableText = text.match(/[a-zA-Z0-9\s]{20,}/g)?.join(' ') || '';
    
    if (readableText.length < 10) {
      return err(new Error('No se pudo extraer texto del documento. Por favor, usa un documento con texto seleccionable.'));
    }

    return ok({
      text: readableText.substring(0, 5000), // Limitar a 5000 caracteres
      mimeType,
      fileName
    });
  } catch (e) {
    const error = e instanceof Error ? e : new Error(String(e));
    return err(new Error(`Error extrayendo documento: ${error.message}`));
  }
}


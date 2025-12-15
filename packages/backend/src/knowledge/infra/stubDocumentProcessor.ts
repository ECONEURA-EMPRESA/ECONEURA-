/**
 * ECONEURA - Knowledge Domain: Stub Document Processor
 * Stub para procesamiento de documentos (pendiente implementación real con PDF.js o similar)
 */
import type { Result } from '../../shared/Result';
import type { DocumentChunk } from '../domain/Document';
import type { DocumentProcessor } from '../domain/ports';

export class StubDocumentProcessor implements DocumentProcessor {
  async extractText(
    buffer: Buffer,
    mimeType: string
  ): Promise<Result<{ pages: string[]; totalPages: number }, Error>> {
    // Stub: retorna texto vacío
    // En producción, esto usaría PDF.js o similar para extraer texto
    if (!mimeType.includes('pdf')) {
      return { success: false, error: new Error('Only PDF files are supported') };
    }

    return {
      success: true,
      data: {
        pages: ['Stub page content'],
        totalPages: 1
      }
    };
  }

  chunkText(pages: string[]): Result<DocumentChunk[], Error> {
    // Stub: crea un chunk por página
    const chunks: Array<{ pageFrom: number; pageTo: number; text: string }> = pages.map((text, index) => ({
      pageFrom: index + 1,
      pageTo: index + 1,
      text
    }));

    return { success: true, data: chunks as unknown as DocumentChunk[] };
  }
}


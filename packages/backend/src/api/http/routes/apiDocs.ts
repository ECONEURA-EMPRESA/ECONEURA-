/**
 * Mejora 8: Documentación Automática de API
 * Genera documentación OpenAPI/Swagger automáticamente
 */
import { Router } from 'express';

const router = Router();

/**
 * GET /api/docs
 * Documentación OpenAPI de la API
 */
router.get('/api/docs', (_req, res) => {
  const docs = {
    openapi: '3.0.0',
    info: {
      title: 'ECONEURA API',
      version: '1.0.0',
      description: 'API para gestión de agentes NEURA y CRM'
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desarrollo'
      }
    ],
    paths: {
      '/api/health': {
        get: {
          summary: 'Health check',
          responses: {
            '200': {
              description: 'Servicio saludable'
            }
          }
        }
      },
      '/api/invoke/{agentId}': {
        post: {
          summary: 'Invocar agente NEURA',
          parameters: [
            {
              name: 'agentId',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              example: 'a-ceo-01'
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    input: { type: 'string', description: 'Mensaje del usuario' },
                    conversationId: { type: 'string', description: 'ID de conversación (opcional)' },
                    image: { type: 'string', format: 'base64', description: 'Imagen en base64 (opcional)' },
                    imageUrl: { type: 'string', format: 'uri', description: 'URL de imagen (opcional)' },
                    file: { type: 'string', format: 'base64', description: 'Archivo en base64 (opcional)' },
                    fileUrl: { type: 'string', format: 'uri', description: 'URL de archivo (opcional)' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Respuesta del agente',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      output: { type: 'string' },
                      conversationId: { type: 'string' },
                      model: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/uploads/sign': {
        post: {
          summary: 'Obtener URL firmada para subida',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    fileName: { type: 'string' },
                    mimeType: { type: 'string' },
                    size: { type: 'number' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'URL firmada generada',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      uploadUrl: { type: 'string' },
                      uploadId: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/crm/leads': {
        get: {
          summary: 'Listar leads del CRM',
          parameters: [
            {
              name: 'department',
              in: 'query',
              schema: { type: 'string', enum: ['cmo', 'cso'] }
            }
          ],
          responses: {
            '200': {
              description: 'Lista de leads'
            }
          }
        }
      }
    }
  };

  res.json(docs);
});

export const apiDocsRoutes = router;

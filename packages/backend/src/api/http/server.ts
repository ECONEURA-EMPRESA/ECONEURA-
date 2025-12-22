import express from 'express';
import cors, { type CorsOptions } from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { chatRoutes } from './routes/chatRoutes';
import { conversationRoutes } from './routes/conversationRoutes';
import { neuraChatRoutes } from './routes/neuraChatRoutes';
import { agentsRoutes } from './routes/agentsRoutes';
import { invokeRoutes } from './routes/invokeRoutes';
import { libraryRoutes } from './routes/libraryRoutes';
import { metricsRoutes, metricsMiddleware } from './routes/metricsRoutes';
import { authMiddleware } from './middleware/authMiddleware';
import { requestIdMiddleware } from './middleware/requestId';
import { noCacheMiddleware } from './middleware/cacheHeaders';
import { globalLimiter, chatLimiter } from './middleware/rateLimiter';
import { errorHandler } from '../../shared/utils/errorHandler';
import { defaultSecurityMiddleware } from './middleware/security';
import { logger } from '../../shared/logger';
import { webhookRoutes } from '../../crm/api/webhookRoutes';
import { crmRoutes } from '../../crm/api/crmRoutes';
import { authRoutes } from './routes/authRoutes';
import { basicHealthCheck, healthCheck as fullHealthCheck, livenessProbe, readinessProbe } from './routes/healthRoutes';
import { getValidatedEnv } from '../../config/env';
import { uploadRoutes } from './routes/uploadRoutes';

export async function createServer() {
  const app = express();
  const env = getValidatedEnv();
  logger.info('[Server] Creating Express server...');
  // ✅ SIN RESTRICCIONES: Límite alto para permitir archivos grandes (como ChatGPT)
  const bodyLimit = env.PAYLOAD_LIMIT ?? '50mb';
  const allowedOrigins = (env.CORS_ALLOWED_ORIGINS ?? 'http://localhost:5173,http://localhost:4173,http://localhost:5174,https://econeura-109cc.web.app,https://econeura-109cc.firebaseapp.com')
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

  const corsOptions: CorsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      logger.warn('[Server] Origin no permitido por CORS', { origin });
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Correlation-Id',
      'X-Department',
      'X-Requested-With'
    ],
    exposedHeaders: ['X-Request-Id']
  };

  // Middleware base (antes de rutas)
  const uploadsDir = path.join(process.cwd(), 'uploads');
  try {
    fs.mkdirSync(uploadsDir, { recursive: true });
  } catch (error) {
    logger.error('[Server] Error creando directorio uploads', {
      error: error instanceof Error ? error.message : String(error)
    });
  }

  app.use(cors(corsOptions));
  app.options(/.*/, cors(corsOptions));

  // ✅ CRÍTICO: NO procesar JSON/URL-encoded para rutas de upload (multer necesita multipart/form-data)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/uploads') || req.path.startsWith('/api/billing/webhook')) {
      // Para uploads y webhooks (raw body), saltar express.json
      return next();
    }
    // Para otras rutas, procesar JSON/URL-encoded normalmente
    express.json({ limit: bodyLimit })(req, res, next);
  });

  app.use((req, res, next) => {
    if (req.path.startsWith('/api/uploads') || req.path.startsWith('/api/billing/webhook')) {
      return next();
    }
    express.urlencoded({ extended: true, limit: bodyLimit })(req, res, next);
  });

  app.use(cookieParser()); // Para CSRF tokens
  app.use(helmet({
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true
    },
    frameguard: { action: 'deny' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://apis.google.com"], // Allow Google Auth
        scriptSrcElem: ["'self'", "'unsafe-inline'", "https://apis.google.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://storage.googleapis.com"], // Allow Cloud Storage
        connectSrc: ["'self'", "https://identitytoolkit.googleapis.com", "https://securetoken.googleapis.com"], // Firebase Auth
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      }
    }
  }));
  app.use(requestIdMiddleware);
  app.use(metricsMiddleware); // Métricas antes de rate limiting
  app.use(noCacheMiddleware);
  // ✅ CORRECCIÓN: Servir uploads con headers CORS para permitir acceso desde frontend
  app.use('/uploads', (req, res, next): void => {
    // Agregar headers CORS para archivos estáticos
    res.header('Access-Control-Allow-Origin', allowedOrigins.includes('*') ? '*' : allowedOrigins.join(','));
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
      return;
    }

    next();
  }, express.static(uploadsDir));

  // ✅ CRÍTICO: Upload routes ANTES de security middleware (multer necesita procesar multipart/form-data primero)
  try {
    app.use('/api/uploads', uploadRoutes);
    logger.info('[Server] Rutas de upload registradas (antes de security middleware)');
  } catch (error) {
    logger.error('[Server] Error cargando rutas de upload', {
      error: error instanceof Error ? error.message : String(error)
    });
    if (process.env['NODE_ENV'] === 'production') {
      throw error;
    }
  }

  // Security middleware (sanitización, payload size, CSRF, MIME validation)
  // ✅ Excluir /api/uploads porque multer ya procesó el archivo
  app.use((req, res, next) => {
    if (req.path.startsWith('/api/uploads')) {
      return next(); // Saltar security middleware para uploads
    }
    defaultSecurityMiddleware(req, res, next);
  });

  // Health checks (sin rate limiting ni auth - deben ser rápidos y públicos)
  app.get('/health', basicHealthCheck); // Health check básico (rápido)
  app.get('/api/health', fullHealthCheck); // Health check completo (verifica dependencias)
  app.get('/api/health/live', livenessProbe); // Liveness probe (Kubernetes)
  app.get('/api/health/ready', readinessProbe); // Readiness probe (Kubernetes)

  // CRM Webhooks (sin auth, pero con HMAC y rate limiting)
  // DEBE estar ANTES de authMiddleware porque son públicos
  try {
    app.use('/api/crm/webhooks', webhookRoutes);
    logger.info('[Server] Rutas de webhooks CRM registradas');
  } catch (error) {
    logger.error('[Server] Error cargando rutas de webhooks CRM', {
      error: error instanceof Error ? error.message : String(error)
    });
    // En desarrollo, continuar sin webhooks; en producción, fallar
    if (process.env['NODE_ENV'] === 'production') {
      throw error;
    }
  }

  // ✅ PUBLIC CHAT (Bypass Auth for fixing 403 issues)
  // User requested "api that works". Moving this before authMiddleware to ensure access.
  app.use(neuraChatRoutes);

  // Rate limiting específico por ruta (PUBLIC)
  app.use('/api/neuras/:neuraId/chat', chatLimiter);

  // Auth routes (ANTES de authMiddleware, pero con rate limiting)
  try {
    app.use('/api/auth', authRoutes);
    logger.info('[Server] Rutas de autenticación registradas');
  } catch (error) {
    logger.error('[Server] Error cargando rutas de autenticación', {
      error: error instanceof Error ? error.message : String(error)
    });
    if (process.env['NODE_ENV'] === 'production') {
      throw error;
    }
  }

  // Root Endpoint
  app.get('/', (_req, res) => {
    res.json({
      name: 'ECONEURA API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      status: 'running'
    });
  });

  // Rate limiting global
  app.use(globalLimiter);

  // A partir de aquí, todas las demás rutas requieren contexto de autenticación
  app.use(authMiddleware);

  // Rate limiting específico por ruta
  // app.use('/api/neuras/:neuraId/chat', chatLimiter); // Moved up
  // Auth routes usarían authLimiter (cuando existan)

  app.use(chatRoutes);
  app.use(conversationRoutes);
  // app.use(neuraChatRoutes); // Moved before authMiddleware
  try {
    app.use(invokeRoutes); // Endpoint /api/invoke/:agentId para compatibilidad con frontend
    logger.info('[Server] Rutas de invoke registradas');
  } catch (error) {
    logger.error('[Server] Error cargando rutas de invoke', {
      error: error instanceof Error ? error.message : String(error)
    });
    if (process.env['NODE_ENV'] === 'production') {
      throw error;
    }
  }
  app.use('/api/agents', agentsRoutes);
  app.use('/api/neura-agents', agentsRoutes); // Alias para compatibilidad con frontend
  app.use('/api/library', libraryRoutes);
  app.use('/api/metrics', metricsRoutes); // Sin auth para Prometheus scraping

  // CRM API (con auth normal)
  try {
    app.use('/api/crm', crmRoutes);
    logger.info('[Server] Rutas CRM registradas');
  } catch (error) {
    logger.error('[Server] Error cargando rutas CRM', {
      error: error instanceof Error ? error.message : String(error)
    });
    // En desarrollo, continuar sin CRM; en producción, fallar
    if (process.env['NODE_ENV'] === 'production') {
      throw error;
    }
  }

  // ✅ BILLING API (SaaS)
  try {
    const { billingRoutes } = await import('../../billing/api/billingRoutes');
    app.use('/api/billing', billingRoutes);
    logger.info('[Server] Rutas BILLING (Stripe) registradas');
  } catch (error) {
    logger.warn('[Server] Error cargando rutas Billing', { error: String(error) });
  }

  // ✅ Mejora 8: Documentación automática de API
  try {
    const { apiDocsRoutes } = await import('./routes/apiDocs');
    app.use(apiDocsRoutes);
    logger.info('[Server] Rutas de documentación API registradas');
  } catch (error) {
    logger.warn('[Server] Error cargando rutas de documentación (no crítico)', {
      error: error instanceof Error ? error.message : String(error)
    });
    // No crítico, continuar sin docs
  }

  // Error handler al final (debe ser el último middleware)
  app.use(errorHandler);

  return app;
}

export type AppServer = ReturnType<typeof createServer>;


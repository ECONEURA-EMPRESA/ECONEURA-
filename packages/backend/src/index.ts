/**
 * ECONEURA - Backend Entry Point
 * Force Restart: 2
 */
import 'dotenv/config'; // Auto-loads .env from CWD (packages/backend)
import { logger } from './shared/logger';

// Función async para inicializar el servidor
async function startServer() {
  try {
    // Validar variables de entorno
    // Dynamic import to ensure it runs after dotenv

    // ✅ DEBUG: Trap unhandled errors to find hidden ioredis/Redis crash
    process.on('uncaughtException', (err) => {
      console.error('🔥 UNCAUGHT EXCEPTION:', err);
      console.error(err.stack);
      // Mantener proceso vivo brevemente para flushear logs si es necesario, pero en Cloud Run mejor morir y reiniciar
      process.exit(1);
    });

    process.on('unhandledRejection', (reason, promise) => {
      console.error('🔥 UNHANDLED REJECTION:', reason);
      if (reason instanceof Error) {
        console.error(reason.stack);
      }
    });

    const { validateEnv, getValidatedEnv } = await import('./config/env');

    validateEnv();
    const env = getValidatedEnv();
    const maskedKey = env.GEMINI_API_KEY ? `${env.GEMINI_API_KEY.substring(0, 4)}...${env.GEMINI_API_KEY.substring(env.GEMINI_API_KEY.length - 4)}` : 'UNDEFINED';
    logger.info(`[Startup] Variables de entorno validadas correctamente. Gemini Key: ${maskedKey}`);

    // Inicializar DI Container (debe ser lo primero)
    const { initializeServices } = await import('./infra/di');



    // Inicializar Redis (para rate limiting distribuido)
    await import('./infra/cache/redisClient');

    // Inicializar Base de Datos (Tablas)
    const { initDatabase } = await import('./infra/persistence/initDb');

    // Inicializar servicios en DI Container
    initializeServices();

    // ✅ Initialize Event Listeners (The Nervous System)
    const { initAutomationListeners } = await import('./automation/listener');
    initAutomationListeners();

    logger.info('[Startup] Servicios inicializados correctamente');

    // Inicializar tablas de BD solo si NO estamos en modo memoria
    if (process.env['USE_MEMORY_STORE'] !== 'true') {
      await initDatabase();
    } else {
      logger.warn('[Startup] Skipping database initialization (USE_MEMORY_STORE=true)');
    }

    // Importar y crear servidor
    const { createServer } = await import('./api/http/server');
    const app = await createServer();

    const port = Number(env.PORT ?? 3001); // Backend en puerto 3001, frontend en 3000

    const server = app.listen(port, () => {
      logger.info(`✅ ECONEURA backend escuchando en el puerto ${port}`, {
        environment: env.NODE_ENV,
        port,
        healthCheck: `http://localhost:${port}/api/health`
      });
    });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`[Shutdown] Recibida señal ${signal}, cerrando servidor...`);

      // 1. Cerrar servidor HTTP (dejar de aceptar nuevas conexiones)
      if (server.closeAllConnections) server.closeAllConnections(); // Speed up shutdown (Node 18+)
      server.close(async () => {
        logger.info('[Shutdown] Servidor HTTP cerrado');

        try {
          // 2. Cerrar conexiones a base de datos y servicios
          const { closeRedis } = await import('./infra/cache/redisClient');
          const { closePostgresPool } = await import('./infra/persistence/postgresPool');

          await Promise.all([
            closeRedis(),
            closePostgresPool()
          ]);

          logger.info('[Shutdown] Conexiones cerradas correctamente');
          process.exit(0);
        } catch (error) {
          logger.error('[Shutdown] Error cerrando conexiones', {
            error: error instanceof Error ? error.message : String(error)
          });
          process.exit(1);
        }
      });

      // Forzar cierre si tarda mucho
      setTimeout(() => {
        logger.error('[Shutdown] Forzando cierre por timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('FATAL STARTUP ERROR:', error);
    logger.error('[Startup] Error fatal iniciando servidor', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    process.exit(1);
  }
}

// Iniciar servidor
startServer();



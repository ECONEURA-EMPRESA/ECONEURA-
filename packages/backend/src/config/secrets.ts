import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import { logger } from '../shared/logger';

const client = new SecretManagerServiceClient();

/**
 * Mapeo de Variables de Entorno -> IDs de Secretos en GCP
 * Clave: Nombre de la variable en process.env (y env.ts)
 * Valor: Nombre del secreto en GCP (proyectos/econeura-109cc/secrets/XXX/versions/latest)
 */
const SECRET_MAPPING: Record<string, string> = {
    DB_PASSWORD: 'ECONEURA_DB_PASSWORD',
    GEMINI_API_KEY: 'ECONEURA_GEMINI_API_KEY',
    JWT_SECRET: 'ECONEURA_JWT_SECRET',
    CRM_WEBHOOK_SECRET: 'ECONEURA_CRM_SECRET',
    STRIPE_SECRET_KEY: 'ECONEURA_STRIPE_SECRET_KEY',
    STRIPE_WEBHOOK_SECRET: 'ECONEURA_STRIPE_WEBHOOK_SECRET'
};

export async function loadSecrets(): Promise<void> {
    // Si estamos en local (no Cloud Run), quizás queramos saltar esto, 
    // pero el usuario pidió "SaaS Nativo". Intentaremos cargar si tenemos credenciales.
    // Si falla, no rompemos la app, solo logueamos (fallback a .env local).

    if (process.env.NODE_ENV === 'test') return;

    const projectId = process.env.GCP_PROJECT_ID || 'econeura-109cc';

    logger.info('[Secrets] Iniciando carga de secretos desde Google Secret Manager...');

    const promises = Object.entries(SECRET_MAPPING).map(async ([envVar, secretName]) => {
        try {
            // Si la variable ya está definida (ej. por .env local), la respetamos PERO
            // en Producción (K_SERVICE existe) deberíamos priorizar Secret Manager.
            const isCloudRun = !!process.env.K_SERVICE;
            if (!isCloudRun && process.env[envVar]) {
                // En local, si ya existe en .env, la dejamos. Ahorra latencia y costes.
                return;
            }

            const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
            const [version] = await client.accessSecretVersion({ name });
            const payload = version.payload?.data?.toString();

            if (payload) {
                process.env[envVar] = payload;
                logger.debug(`[Secrets] Cargado exitosamente: ${envVar}`);
            }
        } catch (error) {
            // No reventamos la app, porque quizás no es crítico si tenemos fallback
            const errMsg = error instanceof Error ? error.message : String(error);
            logger.warn(`[Secrets] No se pudo cargar el secreto ${secretName} para ${envVar}. Usando valor local si existe. Error: ${errMsg}`);
        }
    });

    await Promise.all(promises);
    logger.info('[Secrets] Carga de secretos finalizada.');
}

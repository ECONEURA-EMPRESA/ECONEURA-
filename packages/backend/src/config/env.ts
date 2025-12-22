import { z } from 'zod';
import dotenv from 'dotenv';

// Load env vars immediately
dotenv.config();

// Define Schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8080), // Cloud Run default

  // Persistence (Google Cloud SQL)
  DB_USER: z.string().default('postgres'),
  DB_PASSWORD: z.string().default('password'),
  DB_NAME: z.string().default('econeura'),
  INSTANCE_CONNECTION_NAME: z.string().optional(), // Required in Prod e.g., project:region:instance

  // Storage
  GCP_PROJECT_ID: z.string().default('econeura-109cc'),
  GCP_STORAGE_BUCKET: z.string().optional(),

  // AI
  GEMINI_API_KEY: z.string().optional(), // Must be provided via .env
  OPENAI_API_KEY: z.string().optional(),
  MISTRAL_API_KEY: z.string().optional(),
  OPENAI_BASE_URL: z.string().optional(),
  LLM_BASE_URL: z.string().optional(),

  // Security
  JWT_SECRET: z.string().default('temp_secret_change_me_in_prod'),
  ALLOWED_ORIGINS: z.string().default('*'),
  CORS_ALLOWED_ORIGINS: z.string().default('*'), // Alias

  // Configuration
  PAYLOAD_LIMIT: z.string().default('50mb'),
  PUBLIC_UPLOAD_BASE_URL: z.string().optional(),
  CRM_WEBHOOK_SECRET: z.string().optional(),

  // Billing (Stripe)
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),

  // Storage & Persistent
  REDIS_URL: z.string().optional().transform(v => {
    if (v === 'undefined' || v === 'null' || v?.trim() === '') return undefined;
    return v;
  }),
  DATABASE_URL: z.string().optional(),
  EVENTSTORE_POSTGRES_TABLE: z.string().optional(),

  // Flags
  USE_MEMORY_STORE: z.string().transform(v => v === 'true').optional(),
  RATE_LIMIT_ENABLED: z.string().transform(v => v === 'true').optional(),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | undefined;

export const validateEnv = (): Env => {
  if (_env) return _env;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error('❌ FATAL: Invalid environment variables:');
    console.error(JSON.stringify(result.error.format(), null, 2));
    process.exit(1);
  }

  _env = result.data;
  return _env;
};

// Singleton accessor
export const getValidatedEnv = (): Env => {
  return validateEnv();
};

export const env = getValidatedEnv(); // Eager load

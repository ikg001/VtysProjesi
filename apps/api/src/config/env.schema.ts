import { z } from 'zod';

/**
 * Environment configuration schema using Zod
 * Ensures all required environment variables are present and valid
 */
export const envSchema = z.object({
  // Application
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  API_PORT: z.coerce.number().int().positive().default(3000),
  TIMEZONE: z.string().default('Europe/Istanbul'),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT Authentication
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_REFRESH_EXPIRES_IN: z.string().default('30d'),

  // Supabase (optional)
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_KEY: z.string().optional(),

  // FCM Push Notifications
  FCM_SERVER_KEY: z.string().optional(),
  FCM_SENDER_ID: z.string().optional(),

  // Scheduler/Cron
  CRON_ENABLED: z
    .string()
    .transform((val) => val === 'true')
    .default('false'),
  CRON_TIMEZONE: z.string().default('Europe/Istanbul'),

  // Rate Limiting
  THROTTLE_TTL: z.coerce.number().int().positive().default(60),
  THROTTLE_LIMIT: z.coerce.number().int().positive().default(100),

  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3001'),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * Throws if validation fails
 */
export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
      throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
    }
    throw error;
  }
}

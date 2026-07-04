import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),

  APP_ORIGIN: z.string().default('http://localhost:3000'),

  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/subidha_girls_hostel'),
  JWT_SECRET: z.string().min(16).default('local-development-secret-change-before-production'),
  AUTH_COOKIE_MAX_AGE_DAYS: z.coerce.number().int().positive().default(30),

  // Admin bootstrap (creates the first admin if none exist)
  ADMIN_BOOTSTRAP_USERNAME: z.string().default('admin'),
  ADMIN_BOOTSTRAP_PASSWORD: z.string().default('change-me'),
  ADMIN_BOOTSTRAP_EMAIL: z.string().email().default('pickyourhostel1@gmail.com'),

  // SMTP
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().optional(),

  // Public server URL (for email links)
  PUBLIC_BASE_URL: z.string().default('http://localhost:4000'),
  WHATSAPP_ADMIN_PHONE: z.string().default('9779706666497'),

  // Khalti (Nepal)
  KHALTI_SECRET_KEY: z.string().optional(),
  KHALTI_PUBLIC_KEY: z.string().optional(),
  PAYMENT_RETURN_URL: z.string().optional()
});

export type Env = z.infer<typeof EnvSchema>;

export function getEnv(): Env {
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables.');
  }
  return parsed.data;
}

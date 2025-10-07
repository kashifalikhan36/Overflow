/**
 * Environment Variable Configuration and Validation
 * Validates required environment variables at build time
 */

import { z } from 'zod';

const envSchema = z.object({
  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_APP_NAME: z.string().default('Overflow'),
  NEXT_PUBLIC_APP_VERSION: z.string().default('1.0.0'),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Authentication
  NEXTAUTH_URL: z.string().url().optional(),
  NEXTAUTH_SECRET: z.string().optional(),

  // Google OAuth
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Storage
  NEXT_PUBLIC_MAX_FILE_SIZE: z.string().default('10485760'),
  NEXT_PUBLIC_MAX_FILES: z.string().default('10'),

  // Feature Flags
  NEXT_PUBLIC_ENABLE_COLLABORATION: z.string().default('true'),
  NEXT_PUBLIC_ENABLE_OFFLINE_MODE: z.string().default('true'),
  NEXT_PUBLIC_ENABLE_ANALYTICS: z.string().default('false'),

  // Rate Limiting
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
  GOOGLE_ANALYTICS_ID: z.string().optional(),

  // Redis
  REDIS_URL: z.string().optional(),

  // Email
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  SMTP_FROM: z.string().email().optional(),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
export function validateEnv(): Env {
  try {
    const env = envSchema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
      NEXT_PUBLIC_APP_VERSION: process.env.NEXT_PUBLIC_APP_VERSION,
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
      NEXT_PUBLIC_MAX_FILE_SIZE: process.env.NEXT_PUBLIC_MAX_FILE_SIZE,
      NEXT_PUBLIC_MAX_FILES: process.env.NEXT_PUBLIC_MAX_FILES,
      NEXT_PUBLIC_ENABLE_COLLABORATION: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION,
      NEXT_PUBLIC_ENABLE_OFFLINE_MODE: process.env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE,
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS,
      RATE_LIMIT_MAX_REQUESTS: process.env.RATE_LIMIT_MAX_REQUESTS,
      RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
      SENTRY_DSN: process.env.SENTRY_DSN,
      GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
      REDIS_URL: process.env.REDIS_URL,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_PASSWORD: process.env.SMTP_PASSWORD,
      SMTP_FROM: process.env.SMTP_FROM,
    });
    return env;
  } catch (error) {
    console.error('❌ Invalid environment variables:', error);
    throw new Error('Invalid environment variables');
  }
}

// Export validated env
export const env = validateEnv();

// Utility functions
export const isProduction = process.env.NODE_ENV === 'production';
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isTest = process.env.NODE_ENV === 'test';

// Feature flags
export const featureFlags = {
  collaboration: env.NEXT_PUBLIC_ENABLE_COLLABORATION === 'true',
  offlineMode: env.NEXT_PUBLIC_ENABLE_OFFLINE_MODE === 'true',
  analytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
};

// Storage limits
export const storageLimits = {
  maxFileSize: parseInt(env.NEXT_PUBLIC_MAX_FILE_SIZE, 10),
  maxFiles: parseInt(env.NEXT_PUBLIC_MAX_FILES, 10),
};

// Rate limiting config
export const rateLimitConfig = {
  maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
  windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
};

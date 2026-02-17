import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001').transform((val) => parseInt(val, 10)).pipe(z.number().min(1).max(65535)),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required for Prisma to connect to the database'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_TOKEN_EXPIRES_IN: z.string().default('7d'),
  
  // Mock Authentication (for development only)
  ENABLE_MOCK_AUTH: z.string().transform((val) => val === 'true').default('false'),
});

export const env = envSchema.parse(process.env);

export type Env = z.infer<typeof envSchema>;

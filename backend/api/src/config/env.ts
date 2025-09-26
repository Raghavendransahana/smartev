import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  MONGODB_URI: z
    .string()
    .regex(
      /^mongodb\+srv:\/\//,
      'MONGODB_URI must be a MongoDB Atlas connection string starting with mongodb+srv://'
    ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  LOG_LEVEL: z.string().default('info')
});

type NodeProcessLike = {
  env?: Record<string, string | undefined>;
  exit?: (code?: number) => void;
};

const nodeProcess = (globalThis as { process?: NodeProcessLike }).process;
const parsed = envSchema.safeParse(nodeProcess?.env ?? {});

if (!parsed.success) {
  console.error('Environment validation failed', parsed.error.flatten().fieldErrors);
  nodeProcess?.exit?.(1);
  throw new Error('Environment validation failed');
}

export const env = parsed.data;

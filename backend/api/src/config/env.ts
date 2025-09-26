import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('4000'),
  MONGODB_URI: z
    .string()
    .refine(
      (value) => /^mongodb(\+srv)?:\/\//.test(value),
      'MONGODB_URI must start with mongodb:// or mongodb+srv://'
    ),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1h'),
  LOG_LEVEL: z.string().default('info'),
  BLOCKCHAIN_RPC_URL: z.string().url('BLOCKCHAIN_RPC_URL must be a valid URL'),
  BLOCKCHAIN_PRIVATE_KEY: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/u, 'BLOCKCHAIN_PRIVATE_KEY must be a 64-character hex string prefixed with 0x'),
  BATTERY_CONTRACT_ADDRESS: z
    .string()
    .regex(/^0x[a-fA-F0-9]{40}$/u, 'BATTERY_CONTRACT_ADDRESS must be a checksummed hex address')
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

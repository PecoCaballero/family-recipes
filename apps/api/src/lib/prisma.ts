import { config as loadEnv } from 'dotenv';
import fs from 'node:fs';
import path from 'node:path';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client';
import { shouldUseTls } from './dbConfig';

// Load `apps/api/.env` regardless of the process cwd (nx serve runs from the
// workspace root, while the e2e/manual entrypoints run from `apps/api`).
for (const file of [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'apps/api/.env'),
]) {
  if (fs.existsSync(file)) {
    loadEnv({ path: file });
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl = process.env['DATABASE_URL']!;
const url = new URL(databaseUrl);
const adapter = new PrismaPg({
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
  ...(shouldUseTls(databaseUrl) ? { ssl: { rejectUnauthorized: true } } : {}),
});

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };

import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const url = new URL(process.env['DATABASE_URL']!);
const adapter = new PrismaPg({
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  user: url.username,
  password: url.password,
  database: url.pathname.replace('/', ''),
});

const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export { prisma };

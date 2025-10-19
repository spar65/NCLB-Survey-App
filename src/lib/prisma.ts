/**
 * Prisma Client Singleton
 * @rule 060 "Following API standards for database operations"
 * @rule 150 "Preventing technical debt with proper client management"
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] 
    : ['error'],
});

// Note: Slow query logging disabled for now due to TypeScript compatibility
// TODO: Implement proper query monitoring with Prisma extensions

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;

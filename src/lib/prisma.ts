import { PrismaClient } from '@prisma/client';

// En desarrollo Next recarga los módulos en cada cambio; sin este cache
// abriríamos una conexión nueva a SQLite en cada guardado.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

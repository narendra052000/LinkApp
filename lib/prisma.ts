import { PrismaClient } from '@prisma/client';

// Provide a friendly default DATABASE_URL in development when not set.
// This avoids Prisma initialization errors for developers who forgot to
// set up `.env` before running the app locally. The project still should
// run migrations / generate the client as normal.
if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
  // Use an absolute path with forward slashes to avoid Windows backslash issues
  const defaultDb = `file:${process.cwd().replace(/\\/g, '/')}/prisma/dev.db`;
  process.env.DATABASE_URL = defaultDb;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Avoid instantiating multiple PrismaClient instances in development
  const globalWithPrisma = global as typeof globalThis & {
    prisma: PrismaClient;
  };
  if (!globalWithPrisma.prisma) {
    globalWithPrisma.prisma = new PrismaClient();
  }
  prisma = globalWithPrisma.prisma;
}

export default prisma;

import { PrismaClient } from '@prisma/client';

// Single Prisma instance, reused across HMR reloads in dev.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

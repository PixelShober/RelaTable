import { PrismaClient } from '@prisma/client';
import { clearAll, seedReference, ensureDemoOwner, seedDemo, DEMO_PASSWORD } from '../prisma/seedLib';

export { DEMO_PASSWORD };

const DB = process.env.E2E_DB || process.env.DATABASE_URL!;

function client() {
	// Bind explicitly to the isolated E2E database, independent of .env.
	return new PrismaClient({ datasources: { db: { url: DB } } });
}

/**
 * Reset the isolated E2E database in place (clears rows, reseeds). Uses Prisma
 * Client deleteMany — no destructive DDL — so the running server (which holds
 * the same SQLite file open) sees the changes immediately.
 */
export async function resetDb(demo: boolean) {
	const db = client();
	try {
		await clearAll(db);
		await seedReference(db);
		if (demo) {
			const ownerId = await ensureDemoOwner(db);
			await seedDemo(db, ownerId);
		}
	} finally {
		await db.$disconnect();
	}
}

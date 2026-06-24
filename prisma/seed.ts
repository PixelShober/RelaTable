import { PrismaClient } from '@prisma/client';
import { seedReference, ensureDemoOwner, seedDemo, DEMO_PASSWORD } from './seedLib';

const db = new PrismaClient();

async function main() {
	await seedReference(db);
	console.log('✓ reference data seeded');
	if (process.env.SEED_DEMO === '0') {
		console.log('• SEED_DEMO=0 — reference only (first-run available)');
		return;
	}
	const ownerId = await ensureDemoOwner(db);
	await seedDemo(db, ownerId);
	console.log(`✓ demo data seeded — login password: ${DEMO_PASSWORD}`);
}

main()
	.then(() => db.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await db.$disconnect();
		process.exit(1);
	});

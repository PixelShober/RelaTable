import { execSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { resetDb } from './db';

// Prepare the isolated E2E database before the server boots:
// 1. remove any stale file, 2. create schema via non-destructive `db push`,
// 3. seed demo data. The first-run spec clears it in place at runtime.
export default async function globalSetup() {
	const dbFile = resolve('data/e2e.db');
	for (const suffix of ['', '-journal', '-wal', '-shm']) {
		try {
			rmSync(dbFile + suffix);
		} catch {
			/* not present */
		}
	}

	const env = { ...process.env, DATABASE_URL: process.env.E2E_DB! };
	execSync('npx prisma db push --skip-generate', { env, stdio: 'pipe' });

	await resetDb(true);
}

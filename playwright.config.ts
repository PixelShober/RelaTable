import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

// E2E runs against the production build (`node build`), which reads process.env
// directly (no .env auto-load), so we can point it at an isolated test DB.
const PORT = 4173;
const E2E_DB = 'file:' + resolve('data/e2e.db');
const DATA_DIR = resolve('data');

// Make the URL available to global-setup + specs (same process as config load).
process.env.DATABASE_URL = E2E_DB;
process.env.E2E_DB = E2E_DB;
process.env.DATA_DIR = DATA_DIR;

export default defineConfig({
	testDir: './e2e',
	globalSetup: './e2e/global-setup.ts',
	fullyParallel: false,
	workers: 1,
	retries: 0,
	timeout: 30_000,
	reporter: process.env.CI ? 'list' : [['list']],
	use: {
		baseURL: `http://localhost:${PORT}`,
		trace: 'retain-on-failure'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'npm run build && node build',
		port: PORT,
		reuseExistingServer: false,
		timeout: 180_000,
		env: {
			DATABASE_URL: E2E_DB,
			DATA_DIR,
			PORT: String(PORT),
			ORIGIN: `http://localhost:${PORT}`,
			// Not 'production' so session cookies aren't flagged Secure over http://localhost.
			NODE_ENV: 'test'
		}
	}
});

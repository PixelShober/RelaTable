import { test, expect } from '@playwright/test';
import { resetDb } from './db';

// Runs first (alphabetical, serial). Resets to a clean, owner-less DB, exercises
// the first-run flow, then restores the demo DB for the remaining specs.
test.describe('First-run setup (SCR-001)', () => {
	test.beforeAll(() => resetDb(false));
	test.afterAll(() => resetDb(true));

	test('forces setup, enforces password policy, creates the single owner', async ({ page }) => {
		await page.goto('/');
		await expect(page).toHaveURL(/\/setup$/);

		await page.getByLabel('Anzeigename').fill('E2E Owner');

		const submit = page.getByRole('button', { name: 'Konto erstellen & starten' });
		// Weak password keeps the button disabled.
		await page.getByLabel('Passwort', { exact: true }).fill('short');
		await page.getByLabel('Passwort wiederholen').fill('short');
		await expect(submit).toBeDisabled();

		// Valid password unlocks it.
		const pw = 'E2E-Test-Passwort-9!';
		await page.getByLabel('Passwort', { exact: true }).fill(pw);
		await page.getByLabel('Passwort wiederholen').fill(pw);
		await expect(submit).toBeEnabled();

		await submit.click();
		await expect(page).toHaveURL(/\/graph$/);
	});
});

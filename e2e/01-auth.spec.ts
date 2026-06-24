import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Auth + route guards (SCR-002)', () => {
	test('unauthenticated access is redirected to login', async ({ page }) => {
		await page.goto('/personen');
		await expect(page).toHaveURL(/\/login/);
	});

	test('wrong password shows a generic error (no user enumeration)', async ({ page }) => {
		await page.goto('/login');
		await page.getByLabel('Passwort').fill('falsch-falsch-falsch');
		await page.getByRole('button', { name: 'Anmelden' }).click();
		await expect(page.getByText('Anmeldung fehlgeschlagen.')).toBeVisible();
	});

	test('login lands on the graph, logout returns to login', async ({ page }) => {
		await login(page);
		await expect(page).toHaveURL(/\/graph$/);
		await page.getByRole('button', { name: 'Abmelden' }).first().click();
		await expect(page).toHaveURL(/\/login/);
	});
});

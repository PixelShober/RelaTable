import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Einstellungen (SCR-081/082)', () => {
	test.beforeEach(({ page }) => login(page));

	test('theme switch toggles the dark class and persists', async ({ page }) => {
		await page.goto('/einstellungen');
		await page.getByRole('button', { name: 'Dunkel' }).click();
		await expect(page.locator('html')).toHaveClass(/dark/);
		await page.getByRole('button', { name: 'Hell' }).click();
		await expect(page.locator('html')).not.toHaveClass(/dark/);
	});

	test('shows relationship + event types, exclusion rules and backup', async ({ page }) => {
		await page.goto('/einstellungen');
		await expect(page.getByText('Kategorien & Typen')).toBeVisible();
		await expect(page.getByText('Ausschlussregeln')).toBeVisible();
		await expect(page.getByText('Sex', { exact: false }).first()).toBeVisible();
		await expect(page.getByRole('link', { name: 'Backup erstellen' })).toBeVisible();
	});

	test('can add a context relationship type', async ({ page }) => {
		await page.goto('/einstellungen');
		await page.getByRole('button', { name: '+ Kontext-Typ' }).click();
		await page.getByPlaceholder('Neuer Kontext-Typ').fill('Sportverein');
		await page.getByRole('button', { name: 'Anlegen' }).click();
		await expect(page.getByText('Sportverein')).toBeVisible();
	});
});

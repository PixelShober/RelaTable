import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Pair details (SCR-030)', () => {
	test.beforeEach(({ page }) => login(page));

	test('shows the current type, history and switchable tabs', async ({ page }) => {
		// Persons 1 (Mara) & 2 (Jonas) — an active romance.
		await page.goto('/pair/1-2');
		await expect(page.getByText('Aktuell: Romantik')).toBeVisible();
		await expect(page.getByText('Beziehungsverlauf')).toBeVisible();

		await page.getByRole('button', { name: 'Events', exact: true }).click();
		await expect(page.getByRole('button', { name: 'Nur exakt diese zwei' })).toBeVisible();

		await page.getByRole('button', { name: 'Tagebuch', exact: true }).click();
		await expect(page.getByText('Beziehungstagebuch')).toBeVisible();
	});

	test('history reflects the closeness ladder for Mara & Aylin', async ({ page }) => {
		await page.goto('/pair/1-3');
		await expect(page.getByText('Enge Freundschaft').first()).toBeVisible();
	});
});

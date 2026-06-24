import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Personen (SCR-010/011/012)', () => {
	test.beforeEach(({ page }) => login(page));

	test('list shows demo persons and search filters', async ({ page }) => {
		await page.goto('/personen');
		await expect(page.getByText('Mara Vogt')).toBeVisible();
		await expect(page.getByText('Aylin Kaya')).toBeVisible();

		await page.getByPlaceholder('Suche nach Name…').fill('Aylin');
		await expect(page.getByText('Aylin Kaya')).toBeVisible();
		await expect(page.getByText('Mara Vogt')).toHaveCount(0);
	});

	test('create a new person and land on its profile', async ({ page }) => {
		await page.goto('/personen/neu');
		await page.getByLabel('Name *').fill('Test Person E2E');
		await page.getByLabel('Ort (Stadt/Region genügt)').fill('Berlin');
		await page.getByRole('button', { name: 'Speichern' }).click();

		await expect(page).toHaveURL(/\/personen\/\d+$/);
		await expect(page.getByRole('heading', { name: 'Test Person E2E' }).or(page.getByText('Test Person E2E').first())).toBeVisible();
	});

	test('profile shows relationships sorted with the closest first', async ({ page }) => {
		await page.goto('/personen');
		await page.getByText('Mara Vogt').click();
		await expect(page.getByText('Beziehungen')).toBeVisible();
		// Mara has a Romantik (Jonas) which sorts first.
		await expect(page.getByText('Im Graph fokussieren')).toBeVisible();
	});
});

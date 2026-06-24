import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Graph (SCR-020/021)', () => {
	test.beforeEach(({ page }) => login(page));

	test('renders the cytoscape canvas, legend and zoom controls', async ({ page }) => {
		await page.goto('/graph');
		await expect(page.getByText('128 Personen').or(page.getByText(/\d+ Personen/))).toBeVisible();
		// Cytoscape renders into <canvas> elements inside the container.
		await expect(page.locator('canvas').first()).toBeVisible();
		await expect(page.getByText('Legende')).toBeVisible();
		await expect(page.getByRole('button', { name: 'Einpassen' })).toBeVisible();
	});

	test('focus mode shows the focused person and a back control', async ({ page }) => {
		await page.goto('/graph?focus=1');
		await expect(page.getByText(/Fokus: /)).toBeVisible();
		await expect(page.getByText('Tiefe 1')).toBeVisible();
		await page.getByRole('button', { name: '‹ Zurück' }).click();
		await expect(page).toHaveURL(/\/graph$/);
	});
});

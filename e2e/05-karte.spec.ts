import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Karte (SCR-060/061)', () => {
	test.beforeEach(({ page }) => login(page));

	test('renders the Leaflet map with layer filters and missing-location list', async ({ page }) => {
		await page.goto('/karte');
		await expect(page.locator('.leaflet-container')).toBeVisible();
		await expect(page.getByText('Layer')).toBeVisible();

		// Toggling the persons layer off keeps the map alive (no crash).
		await page.getByLabel('Layer Personen').uncheck();
		await expect(page.locator('.leaflet-container')).toBeVisible();

		// Items without coordinates are listed separately (AC-093).
		await expect(page.getByText('Ohne Standort')).toBeVisible();
	});
});

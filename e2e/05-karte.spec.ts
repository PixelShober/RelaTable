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

		// The map can switch into a graph-like people/connections mode.
		await page.getByLabel('Nur Personen und Verbindungen').check();
		await expect(page.getByText('Verbindungen', { exact: true })).toBeVisible();
		await expect(page.getByText('Freundschaft', { exact: true })).toBeVisible();
		await expect
			.poll(async () => await page.locator('.leaflet-marker-icon').count())
			.toBeGreaterThan(0);
	});

	test('mobile legend stays above the bottom navigation', async ({ page }) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto('/karte');
		const legend = page.getByTestId('map-legend-overlay');
		const bottomNav = page.getByRole('navigation', { name: 'Hauptnavigation mobil' });
		await expect(legend).toBeVisible();
		await expect(bottomNav).toBeVisible();

		const legendBox = await legend.boundingBox();
		const navBox = await bottomNav.boundingBox();
		expect(legendBox).not.toBeNull();
		expect(navBox).not.toBeNull();
		expect(legendBox!.y + legendBox!.height).toBeLessThanOrEqual(navBox!.y - 8);

		const centerX = legendBox!.x + legendBox!.width / 2;
		const centerY = legendBox!.y + Math.min(legendBox!.height / 2, 40);
		await page.mouse.move(centerX, centerY);
		await page.mouse.wheel(0, 1200);

		const legendBoxAfter = await legend.boundingBox();
		expect(legendBoxAfter).not.toBeNull();
		expect(legendBoxAfter!.y + legendBoxAfter!.height).toBeLessThanOrEqual(navBox!.y - 8);
	});
});

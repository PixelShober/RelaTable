import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Events via UI (SCR-050/051)', () => {
	test.beforeEach(({ page }) => login(page));

	test('lists demo events and hides sensitive ones by default', async ({ page }) => {
		await page.goto('/ereignisse');
		await expect(page.getByText('Festival Wacken')).toBeVisible();
		// The sensitive "Intimer Abend" (Sex) is hidden until toggled.
		await expect(page.getByText('Intimer Abend')).toHaveCount(0);
		await page.getByRole('button', { name: /Sensible:/ }).click();
		await expect(page.getByText('Intimer Abend')).toBeVisible();
	});

	test('create an event with participants; it appears in list and on a profile', async ({ page }) => {
		await page.goto('/ereignisse/neu');
		await page.getByLabel('Name').fill('E2E Brunch');
		await page.locator('#ev-type').selectOption({ label: 'Party' });
		await page.getByPlaceholder('Person suchen + hinzufügen…').fill('Mara');
		await page.getByRole('button', { name: 'Mara Vogt' }).click();
		await page.getByPlaceholder('Person suchen + hinzufügen…').fill('Sven');
		await page.getByRole('button', { name: 'Sven Brandt' }).click();
		await page.getByRole('button', { name: 'Speichern' }).click();
		await page.waitForURL(/\/ereignisse\/\d+$/);

		await page.goto('/ereignisse');
		await expect(page.getByText('E2E Brunch')).toBeVisible();

		// Appears on Mara's profile timeline (id 1).
		await page.goto('/personen/1');
		await expect(page.getByText('E2E Brunch')).toBeVisible();
	});

	test('blocks an event without participants', async ({ page }) => {
		await page.goto('/ereignisse/neu');
		await page.getByLabel('Name').fill('Ohne Teilnehmer');
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText('Mindestens ein Teilnehmer erforderlich.')).toBeVisible();
	});
});

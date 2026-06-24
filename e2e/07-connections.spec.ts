import { test, expect } from '@playwright/test';
import { login } from './helpers';

// Demo ids: 1 Mara, 2 Jonas, 3 Aylin, 4 Sven, 5 Lia, 6 Isolde (isolated).
test.describe('Connections via UI + rule-enforced actions', () => {
	test.beforeEach(({ page }) => login(page));

	test('create a connection, change Nähegrad, start romance, and rules block a Nähegrad during romance', async ({ page }) => {
		// Create Isolde ↔ Sven as Freundschaft.
		await page.goto('/verbindung/neu?from=6');
		await page.locator('#toId').selectOption({ label: 'Sven Brandt' });
		await page.locator('#typeId').selectOption({ label: 'Freundschaft (Naehegrad)' });
		await page.getByRole('button', { name: 'Verbindung anlegen' }).click();
		await page.waitForURL('**/pair/**');
		await expect(page.getByText('Aktuell: Freundschaft')).toBeVisible();

		// Upgrade to Enge Freundschaft.
		await page.getByRole('button', { name: 'Aktion ▾' }).click();
		await page.locator('#pair-action').selectOption('closeness');
		await page.locator('#cl').selectOption({ label: 'Enge Freundschaft' });
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText('Aktuell: Enge Freundschaft')).toBeVisible();

		// Start a romance (ends the closeness).
		await page.getByRole('button', { name: 'Aktion ▾' }).click();
		await page.locator('#pair-action').selectOption('romance-start');
		await page.getByRole('button', { name: 'Bestätigen' }).click();
		await expect(page.getByText('Aktuell: Romantik')).toBeVisible();

		// A Nähegrad during an active romance must be refused (E-NG-ROM).
		await page.getByRole('button', { name: 'Aktion ▾' }).click();
		await page.locator('#pair-action').selectOption('closeness');
		await page.locator('#cl').selectOption({ label: 'Freundschaft' });
		await page.getByRole('button', { name: 'Speichern' }).click();
		await expect(page.getByText(/Während einer romantischen Beziehung/)).toBeVisible();
		await expect(page.getByText('Aktuell: Romantik')).toBeVisible();
	});

	test('add a journal entry from the pair action menu', async ({ page }) => {
		await page.goto('/pair/1-3'); // Mara & Aylin
		await page.getByRole('button', { name: 'Aktion ▾' }).click();
		await page.locator('#pair-action').selectOption('journal');
		await page.locator('#jt').fill('E2E Tagebucheintrag');
		await page.getByRole('button', { name: 'Eintragen' }).click();
		await page.getByRole('button', { name: 'Tagebuch', exact: true }).click();
		await expect(page.getByText('E2E Tagebucheintrag')).toBeVisible();
	});
});

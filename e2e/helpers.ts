import type { Page } from '@playwright/test';
import { DEMO_PASSWORD } from './db';

/** Log in as the demo owner and wait for the app shell. */
export async function login(page: Page, password = DEMO_PASSWORD) {
	await page.goto('/login');
	await page.getByLabel('Passwort').fill(password);
	await page.getByRole('button', { name: 'Anmelden' }).click();
	await page.waitForURL('**/graph');
}

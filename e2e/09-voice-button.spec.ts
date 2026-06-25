import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Voice Button (SCR-060)', () => {
	test.beforeEach(({ page }) => login(page));

	test('FAB is visible after login', async ({ page }) => {
		await page.goto('/graph');
		await expect(page.getByRole('button', { name: 'Mikrofon starten' })).toBeVisible();
	});

	test('blocked button shows popup with no-key message', async ({ page }) => {
		await page.goto('/graph');
		const btn = page.getByRole('button', { name: 'Mikrofon starten' });
		// Wait for voice-status fetch to complete — button goes opacity-50 when blocked.
		await expect(btn).toHaveClass(/opacity-50/);
		// aria-disabled blocks Playwright's actionability check — force bypasses it.
		await btn.click({ force: true });
		await expect(page.getByText('Kein OpenRouter-API-Key')).toBeVisible();
	});

	test('/api/voice-status returns non-null reason when no API key', async ({ page }) => {
		const res = await page.request.get('/api/voice-status');
		expect(res.status()).toBe(200);
		const body = await res.json();
		expect(body.reason).not.toBeNull();
	});

	test('/api/narrate POST without messages returns 400', async ({ page }) => {
		const res = await page.request.post('/api/narrate', { data: {} });
		expect(res.status()).toBe(400);
	});
});

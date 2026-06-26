import { test, expect } from '@playwright/test';
import { login } from './helpers';

test.describe('Voice Button (SCR-060)', () => {
	test.beforeEach(({ page }) => login(page));
	test.afterEach(async ({ page }) => {
		await page.request.post('/api/setting', { data: { key: 'narrateAutoApprove', value: 'false' } }).catch(() => {});
		await page.request.post('/api/setting', { data: { key: 'narratePragmaticMode', value: 'false' } }).catch(() => {});
	});

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

	test('conversation panel scrolls to bottom after new messages', async ({ page }) => {
		// Unblock the voice button and mock narrate so we can drive the convo panel.
		await page.route('/api/voice-status', (r) => r.fulfill({ json: { reason: null } }));
		await page.route('/api/narrate', (r) =>
			r.fulfill({
				json: {
					reply:
						'Testantwort vom Assistenten.\n\n' +
						Array(12).fill('Zusätzliche Zeile für Scroll-Höhe.').join('\n')
				}
			})
		);
		await page.goto('/graph');

		// Wait for voice-status to be fetched; button should no longer be opacity-50.
		const fab = page.getByRole('button', { name: 'Mikrofon starten' });
		await expect(fab).not.toHaveClass(/opacity-50/, { timeout: 5000 });

		// Click FAB and confirm without speech to open the conversation panel.
		await fab.click();
		await page.getByRole('button', { name: 'Aufnahme bestätigen und senden' }).click();
		// The conversation panel should be open.
		await expect(page.getByRole('textbox', { name: 'Antwort' })).toBeVisible();

		// Send a typed message and verify the container scrolled to bottom.
		const input = page.getByRole('textbox', { name: 'Antwort' });
		await input.fill('Hallo Welt');
		await page.getByRole('button', { name: 'Senden', exact: true }).click();

		// Wait for the assistant reply to appear.
		await expect(page.getByText('Testantwort vom Assistenten.')).toBeVisible();

		// The scroll container should be scrolled to bottom (scrollTop ≈ scrollHeight - clientHeight).
		const scrolledToBottom = await page.getByTestId('voice-convo-messages').evaluate((el) => {
			return Math.abs(el.scrollHeight - el.scrollTop - el.clientHeight) < 5;
		});
		expect(scrolledToBottom).toBe(true);
	});

	test('compact auto mode processes voice without opening the chat panel', async ({ page }) => {
		let narrateCalled = false;
		await page.addInitScript(() => {
			class FakeSpeechRecognition {
				lang = '';
				continuous = false;
				interimResults = false;
				onstart?: () => void;
				onresult?: (event: unknown) => void;
				onend?: () => void;
				start() {
					this.onstart?.();
					setTimeout(() => {
						const result: any = [{ transcript: 'Ich habe mit Finn Mittag gegessen' }];
						result.isFinal = true;
						const results: any = [result];
						this.onresult?.({ resultIndex: 0, results });
					}, 50);
				}
				stop() {
					this.onend?.();
				}
			}
			(window as any).SpeechRecognition = FakeSpeechRecognition;
			(window as any).webkitSpeechRecognition = FakeSpeechRecognition;
		});
		await page.route('/api/voice-status', (r) => r.fulfill({ json: { reason: null } }));
		await page.route('/api/narrate', async (r) => {
			narrateCalled = true;
			await new Promise((resolve) => setTimeout(resolve, 800));
			await r.fulfill({
				json: {
					reply: 'Angelegt.',
					messages: [],
					wrote: true
				}
			});
		});
		await page.goto('/graph');
		await page.request.post('/api/setting', { data: { key: 'narrateAutoApprove', value: 'true' } });
		await page.request.post('/api/setting', { data: { key: 'narratePragmaticMode', value: 'true' } });
		await page.reload();

		const fab = page.getByRole('button', { name: 'Mikrofon starten' });
		await expect(fab).not.toHaveClass(/opacity-50/, { timeout: 5000 });
		await fab.click();
		await expect(page.getByText('Ich habe mit Finn Mittag gegessen')).toBeVisible();
		await page.getByRole('button', { name: 'Aufnahme bestätigen und senden' }).click();

		await expect(page.getByRole('textbox', { name: 'Antwort' })).toHaveCount(0);
		await expect(page.getByRole('status').filter({ hasText: 'Prompt läuft' })).toBeVisible();
		await expect.poll(() => narrateCalled).toBe(true);
		await expect(page.getByText('Angelegt.')).toHaveCount(0);
	});
});

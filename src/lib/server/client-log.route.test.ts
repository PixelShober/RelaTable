import { afterEach, describe, expect, it, vi } from 'vitest';

const { POST } = await import('../../routes/api/client-log/+server');

afterEach(() => vi.restoreAllMocks());

describe('POST /api/client-log', () => {
	it('ohne User → 401', async () => {
		const req = new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ event: 'speech.recognition_error' })
		});
		await expect(POST({ request: req, locals: {} } as any)).rejects.toMatchObject({ status: 401 });
	});

	it('loggt nur erlaubte, gekürzte Client-Felder', async () => {
		const info = vi.spyOn(console, 'info').mockImplementation(() => {});
		const req = new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				event: 'speech.recognition_error',
				errorCode: 'network',
				errorMessage: 'x'.repeat(700),
				transcript: 'darf nicht geloggt werden',
				apiKey: 'secret'
			})
		});

		const res = await POST({ request: req, locals: { user: { id: 7 } } } as any);
		const data = await res.json();
		const logged = JSON.parse(String(info.mock.calls[0][0]));

		expect(data).toEqual({ ok: true });
		expect(logged).toMatchObject({
			scope: 'relatable:client',
			userId: 7,
			event: 'speech.recognition_error',
			errorCode: 'network'
		});
		expect(logged.errorMessage).toHaveLength(500);
		expect(logged.transcript).toBeUndefined();
		expect(logged.apiKey).toBeUndefined();
	});
});

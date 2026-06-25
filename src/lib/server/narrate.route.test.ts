import { vi, describe, it, expect, afterEach } from 'vitest';
import { runNarration } from '$lib/server/narrate';

vi.mock('$lib/server/narrate', () => ({
	runNarration: vi.fn()
}));
vi.mock('$lib/server/settings', () => ({
	getSetting: vi.fn().mockResolvedValue(null),
	getBoolSetting: vi.fn().mockResolvedValue(false),
	SETTING_KEYS: {
		openRouterApiKey: 'openRouterApiKey',
		openRouterModel: 'openRouterModel',
		narrateAutoApprove: 'narrateAutoApprove'
	}
}));

const { POST } = await import('../../routes/api/narrate/+server');

afterEach(() => vi.clearAllMocks());

describe('POST /api/narrate', () => {
	it('ohne User → 401', async () => {
		const req = new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ messages: [] })
		});
		await expect(POST({ request: req, locals: {} } as any)).rejects.toMatchObject({ status: 401 });
	});

	it('ohne messages → 400', async () => {
		const req = new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({})
		});
		await expect(
			POST({ request: req, locals: { user: { id: 1 } } } as any)
		).rejects.toMatchObject({ status: 400 });
	});

	it('mit messages → delegiert an runNarration', async () => {
		vi.mocked(runNarration).mockResolvedValue({ reply: 'ok', messages: [], wrote: false });
		const msgs = [{ role: 'user', content: 'Hallo' }];
		const req = new Request('http://localhost/', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({ messages: msgs })
		});
		const res = await POST({ request: req, locals: { user: { id: 1 } } } as any);
		const data = await res.json();

		expect(runNarration).toHaveBeenCalledWith(
			msgs,
			{ apiKey: undefined, model: undefined, autoApprove: false }
		);
		expect(data).toEqual({ reply: 'ok', messages: [], wrote: false });
	});
});

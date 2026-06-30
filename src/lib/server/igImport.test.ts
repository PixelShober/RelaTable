import { describe, it, expect } from 'vitest';
import { parseScriptOutput, sessionFilePath, isValidIgUsername } from './igImport';

describe('parseScriptOutput', () => {
	it('parses a successful payload and maps snake_case fields', () => {
		const out = JSON.stringify({
			ok: true,
			count: 2,
			followees: [
				{ username: 'mara.v', full_name: 'Mara V', profile_pic_url: 'https://x/p.jpg' },
				{ username: 'leo', full_name: '', profile_pic_url: '' }
			]
		});
		const r = parseScriptOutput(out);
		expect(r.ok).toBe(true);
		expect(r.followees).toEqual([
			{ username: 'mara.v', fullName: 'Mara V', profilePicUrl: 'https://x/p.jpg' },
			{ username: 'leo', fullName: '', profilePicUrl: '' }
		]);
	});

	it('ignores log noise before the final JSON line', () => {
		const out = 'warning: something\n' + JSON.stringify({ ok: true, followees: [] });
		expect(parseScriptOutput(out).ok).toBe(true);
	});

	it('surfaces the script error message', () => {
		const r = parseScriptOutput(JSON.stringify({ ok: false, error: 'Keine Session' }));
		expect(r).toEqual({ ok: false, error: 'Keine Session' });
	});

	it('drops entries without a username', () => {
		const out = JSON.stringify({ ok: true, followees: [{ username: '', full_name: 'x' }] });
		expect(parseScriptOutput(out).followees).toEqual([]);
	});

	it('reports empty / invalid output', () => {
		expect(parseScriptOutput('').ok).toBe(false);
		expect(parseScriptOutput('not json').ok).toBe(false);
	});
});

describe('session path + username', () => {
	it('builds the session path under XDG_CONFIG_HOME, lowercased', () => {
		const prev = process.env.XDG_CONFIG_HOME;
		process.env.XDG_CONFIG_HOME = '/data';
		expect(sessionFilePath('Pixel.Thenics')).toBe('/data/instaloader/session-pixel.thenics');
		expect(sessionFilePath('@Foo')).toBe('/data/instaloader/session-foo');
		if (prev === undefined) delete process.env.XDG_CONFIG_HOME;
		else process.env.XDG_CONFIG_HOME = prev;
	});

	it('rejects usernames that could escape the session dir', () => {
		expect(isValidIgUsername('pixel.thenics')).toBe(true);
		expect(isValidIgUsername('../../etc/passwd')).toBe(false);
		expect(isValidIgUsername('a/b')).toBe(false);
		expect(isValidIgUsername('')).toBe(false);
	});
});

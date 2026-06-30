import { spawn } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';

/** Where instaloader expects its session file. Mirrors instaloader's get_default_session_filename:
 *  $XDG_CONFIG_HOME/instaloader/session-<user>  (on the VPS XDG_CONFIG_HOME=/data, the writable volume). */
export function sessionFilePath(username: string): string {
	const user = username.trim().toLowerCase().replace(/^@/, '');
	const base = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
	return join(base, 'instaloader', `session-${user}`);
}

/** IG usernames: letters, digits, dot, underscore. Reject anything else (path-traversal guard). */
export function isValidIgUsername(username: string): boolean {
	return /^[a-z0-9._]+$/.test(username.trim().toLowerCase().replace(/^@/, ''));
}

export interface Followee {
	username: string;
	fullName: string;
	profilePicUrl: string;
}

export interface FetchResult {
	ok: boolean;
	followees?: Followee[];
	error?: string;
}

/** Parse the JSON the Python script prints. Pure + tested. */
export function parseScriptOutput(stdout: string): FetchResult {
	const line = stdout.trim().split('\n').filter(Boolean).pop();
	if (!line) return { ok: false, error: 'Keine Ausgabe vom Instagram-Skript' };
	let obj: unknown;
	try {
		obj = JSON.parse(line);
	} catch {
		return { ok: false, error: 'Instagram-Skript lieferte ungültiges JSON' };
	}
	const o = obj as Record<string, unknown>;
	if (!o.ok) return { ok: false, error: String(o.error || 'Unbekannter Fehler') };
	const followees = (Array.isArray(o.followees) ? o.followees : [])
		.map((f) => {
			const r = f as Record<string, unknown>;
			return {
				username: String(r.username || '').trim(),
				fullName: String(r.full_name || '').trim(),
				profilePicUrl: String(r.profile_pic_url || '').trim()
			};
		})
		.filter((f) => f.username);
	return { ok: true, followees };
}

/** Spawn the instaloader helper and return the followees of `igUsername`. */
export function fetchFollowings(igUsername: string): Promise<FetchResult> {
	return new Promise((resolve) => {
		const child = spawn('python3', ['scripts/ig_followings.py', igUsername], {
			cwd: process.cwd()
		});
		let out = '';
		let err = '';
		child.stdout.on('data', (d) => (out += d));
		child.stderr.on('data', (d) => (err += d));
		child.on('error', () =>
			resolve({ ok: false, error: 'python3 nicht gefunden — bitte Python + instaloader installieren' })
		);
		child.on('close', (code) => {
			const parsed = parseScriptOutput(out);
			if (!parsed.ok && code !== 0 && err.trim() && parsed.error?.startsWith('Keine Ausgabe')) {
				resolve({ ok: false, error: err.trim().split('\n').pop() || parsed.error });
			} else {
				resolve(parsed);
			}
		});
	});
}

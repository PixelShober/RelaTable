import { fail } from '@sveltejs/kit';
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';
import { db } from '$lib/server/db';
import { fetchFollowings, sessionFilePath, isValidIgUsername, instaloaderLogin } from '$lib/server/igImport';
import { saveImageFromUrl } from '$lib/server/uploads';
import type { Actions, PageServerLoad } from './$types';

const normHandle = (h: string) => h.trim().toLowerCase().replace(/^@/, '').replace(/\/+$/, '');

async function savedSessions(): Promise<string[]> {
	const base = process.env.XDG_CONFIG_HOME || join(homedir(), '.config');
	try {
		const files = await readdir(join(base, 'instaloader'));
		return files.filter((f) => f.startsWith('session-')).map((f) => f.slice('session-'.length)).filter(isValidIgUsername);
	} catch {
		return [];
	}
}

export const load: PageServerLoad = async ({ locals }) => {
	const ownerId = locals.user!.id;
	const [persons, sessions] = await Promise.all([
		db.person.findMany({
			where: { ownerId },
			select: { id: true, name: true, socialAccounts: { select: { platform: true, handle: true } } },
			orderBy: { name: 'asc' }
		}),
		savedSessions()
	]);
	const byHandle: Record<string, number> = {};
	const byName: Record<string, number> = {};
	for (const p of persons) {
		byName[p.name.toLowerCase()] = p.id;
		for (const s of p.socialAccounts) {
			if (s.platform.toLowerCase() === 'instagram') byHandle[normHandle(s.handle)] = p.id;
		}
	}
	return {
		persons: persons.map((p) => ({ id: p.id, name: p.name })),
		matchHandle: byHandle,
		matchName: byName,
		sessions
	};
};

export const actions: Actions = {
	fetch: async ({ request }) => {
		const data = await request.formData();
		const igUsername = String(data.get('igUsername') ?? '').trim();
		if (!igUsername) return fail(400, { fetchError: 'Instagram-Benutzername fehlt' });
		const res = await fetchFollowings(igUsername);
		if (!res.ok) return fail(400, { fetchError: res.error });
		return { followees: res.followees, igUsername };
	},

	login: async ({ request }) => {
		const data = await request.formData();
		const username = String(data.get('igUsername') ?? '').trim().toLowerCase().replace(/^@/, '');
		const password = String(data.get('password') ?? '');
		const code = String(data.get('code') ?? '').trim();
		if (!isValidIgUsername(username)) return fail(400, { loginError: 'Ungültiger Instagram-Benutzername' });
		if (!password) return fail(400, { loginError: 'Passwort fehlt' });
		const loginRes = await instaloaderLogin(username, password, code);
		if (!loginRes.ok) return fail(400, { loginError: loginRes.error });
		// Auto-fetch immediately after login — no extra click needed.
		const fetchRes = await fetchFollowings(username);
		if (!fetchRes.ok) return { loginOk: loginRes.username, fetchError: fetchRes.error, followees: undefined };
		return { loginOk: loginRes.username, followees: fetchRes.followees, igUsername: username };
	},

	import: async ({ request, locals }) => {
		const ownerId = locals.user!.id;
		const data = await request.formData();
		let items: { username: string; name: string; profilePicUrl: string; matchPersonId: number | null }[];
		try {
			items = JSON.parse(String(data.get('selection') ?? '[]'));
		} catch {
			return fail(400, { importError: 'Ungültige Auswahl' });
		}
		if (!items.length) return fail(400, { importError: 'Nichts ausgewählt' });

		let created = 0;
		let updated = 0;
		let imagesSaved = 0;

		for (const it of items) {
			const username = normHandle(it.username);
			if (!username) continue;
			const handle = `@${username}`;
			const url = `https://www.instagram.com/${username}/`;
			const fileName = it.profilePicUrl ? await saveImageFromUrl(it.profilePicUrl) : null;
			if (fileName) imagesSaved++;

			if (it.matchPersonId) {
				const person = await db.person.findFirst({ where: { id: it.matchPersonId, ownerId } });
				if (!person) continue;
				await db.person.update({ where: { id: person.id }, data: { profileImagePath: fileName ?? undefined } });
				const exists = await db.socialAccount.findFirst({ where: { personId: person.id, platform: 'Instagram', handle } });
				if (!exists) await db.socialAccount.create({ data: { personId: person.id, platform: 'Instagram', handle, url } });
				updated++;
			} else {
				await db.person.create({
					data: {
						ownerId,
						name: (it.name || username).trim(),
						profileImagePath: fileName,
						socialAccounts: { create: { platform: 'Instagram', handle, url } }
					}
				});
				created++;
			}
		}

		return { importResult: { created, updated, imagesSaved, total: items.length } };
	}
};

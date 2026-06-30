import { fail } from '@sveltejs/kit';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { db } from '$lib/server/db';
import { fetchFollowings, parseScriptOutput, sessionFilePath, isValidIgUsername } from '$lib/server/igImport';
import { saveImageFromUrl } from '$lib/server/uploads';
import type { Actions, PageServerLoad } from './$types';

const normHandle = (h: string) => h.trim().toLowerCase().replace(/^@/, '').replace(/\/+$/, '');

export const load: PageServerLoad = async ({ locals }) => {
	const ownerId = locals.user!.id;
	const persons = await db.person.findMany({
		where: { ownerId },
		select: { id: true, name: true, socialAccounts: { select: { platform: true, handle: true } } },
		orderBy: { name: 'asc' }
	});
	// handle/name → personId, so the client can pre-select an obvious match.
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
		matchName: byName
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

	// VPS-Pfad: Session-Datei (einmalig lokal via `instaloader --login` erzeugt) hochladen, damit
	// der Server selbst fetchen kann. Kein Passwort/2FA auf dem Server.
	session: async ({ request }) => {
		const data = await request.formData();
		const username = String(data.get('igUsername') ?? '').trim().toLowerCase().replace(/^@/, '');
		const file = data.get('session');
		if (!isValidIgUsername(username)) return fail(400, { sessionError: 'Ungültiger Instagram-Benutzername' });
		if (!(file instanceof File) || file.size === 0) return fail(400, { sessionError: 'Keine Session-Datei' });
		if (file.size > 256 * 1024) return fail(400, { sessionError: 'Datei zu groß — das ist keine Session-Datei' });
		const path = sessionFilePath(username);
		await mkdir(dirname(path), { recursive: true });
		await writeFile(path, Buffer.from(await file.arrayBuffer()));
		return { sessionSaved: username };
	},

	// Hosting-Pfad: Fetch lokal ausführen, Skript-JSON hier einfügen (kein instaloader/IG-Login auf dem Server).
	paste: async ({ request }) => {
		const data = await request.formData();
		const res = parseScriptOutput(String(data.get('json') ?? ''));
		if (!res.ok) return fail(400, { fetchError: res.error });
		return { followees: res.followees, igUsername: '' };
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
				// Don't overwrite an existing image or rename the person — only fill gaps + add the link.
				if (fileName && !person.profileImagePath) {
					await db.person.update({ where: { id: person.id }, data: { profileImagePath: fileName } });
				}
				const exists = await db.socialAccount.findFirst({
					where: { personId: person.id, platform: 'Instagram', handle }
				});
				if (!exists) {
					await db.socialAccount.create({ data: { personId: person.id, platform: 'Instagram', handle, url } });
				}
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

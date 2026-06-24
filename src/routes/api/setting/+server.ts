import { json, error } from '@sveltejs/kit';
import { setSetting, SETTING_KEYS } from '$lib/server/settings';
import { db } from '$lib/server/db';
import type { RequestHandler } from './$types';

const ALLOWED = new Set<string>([...Object.values(SETTING_KEYS), 'themePreference']);

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'unauthenticated');
	const { key, value } = await request.json();
	if (typeof key !== 'string' || !ALLOWED.has(key)) throw error(400, 'unknown setting');
	const val = String(value);

	if (key === 'themePreference') {
		await db.appUser.update({ where: { id: locals.user.id }, data: { themePreference: val } });
	} else {
		await setSetting(locals.user.id, key, val);
	}
	return json({ ok: true });
};

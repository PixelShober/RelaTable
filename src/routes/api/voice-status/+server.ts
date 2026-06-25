import { json, error } from '@sveltejs/kit';
import { getSetting, SETTING_KEYS } from '$lib/server/settings';
import { openRouterStatus } from '$lib/server/openrouterStatus';
import type { RequestHandler } from './$types';

// Owner-only: is the voice/narration backend usable right now? Drives the mic
// button's enabled/grayed state + tooltip (setting overrides ENV fallback).
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet.');
	if (!process.env.RELATABLE_MCP_TOKEN) {
		return json({ ok: false, reason: 'error', message: 'MCP-Token nicht konfiguriert (RELATABLE_MCP_TOKEN fehlt).' });
	}
	const key = (await getSetting(locals.user.id, SETTING_KEYS.openRouterApiKey)) || process.env.OPENROUTER_API_KEY || null;
	return json(await openRouterStatus(key));
};

import { json, error } from '@sveltejs/kit';
import { getSetting, SETTING_KEYS } from '$lib/server/settings';
import { openRouterStatus } from '$lib/server/openrouterStatus';
import type { RequestHandler } from './$types';

// Owner-only: is the voice/narration backend usable right now? Drives the mic
// button's enabled/grayed state + tooltip (setting overrides ENV fallback).
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet.');
	const key = (await getSetting(locals.user.id, SETTING_KEYS.openRouterApiKey)) || process.env.OPENROUTER_API_KEY || null;
	return json(await openRouterStatus(key));
};

import { json, error } from '@sveltejs/kit';
import { runNarration, type Msg } from '$lib/server/narrate';
import { getBoolSetting, getSetting, SETTING_KEYS } from '$lib/server/settings';
import type { RequestHandler } from './$types';

// In-App-Erzählung: Owner-only (Cookie-Session via hooks.server.ts). Der Client
// schickt die laufende Konversation, der Server fährt einen Agenten-Loop und
// liefert die nächste Rückfrage/Zusammenfassung + ob geschrieben wurde.
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet.');
	const body = await request.json().catch(() => null);
	const messages = body?.messages as Msg[] | undefined;
	if (!Array.isArray(messages)) throw error(400, 'messages[] erforderlich.');
	const [apiKey, model, autoApprove] = await Promise.all([
		getSetting(locals.user.id, SETTING_KEYS.openRouterApiKey),
		getSetting(locals.user.id, SETTING_KEYS.openRouterModel),
		getBoolSetting(locals.user.id, SETTING_KEYS.narrateAutoApprove, false)
	]);
	try {
		return json(
			await runNarration(messages, { apiKey: apiKey ?? undefined, model: model ?? undefined, autoApprove })
		);
	} catch (e) {
		throw error(500, e instanceof Error ? e.message : 'Erzählung fehlgeschlagen.');
	}
};

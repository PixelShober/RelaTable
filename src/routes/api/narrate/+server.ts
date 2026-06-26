import { json, error } from '@sveltejs/kit';
import { runNarration, type Msg } from '$lib/server/narrate';
import { getBoolSetting, getSetting, SETTING_KEYS } from '$lib/server/settings';
import type { RequestHandler } from './$types';

function traceId() {
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function logNarrateRoute(level: 'info' | 'error', event: string, fields: Record<string, unknown>) {
	const payload = {
		scope: 'relatable:narrate-route',
		event,
		ts: new Date().toISOString(),
		...fields
	};
	const line = JSON.stringify(payload);
	if (level === 'error') console.error(line);
	else console.info(line);
}

// In-App-Erzählung: Owner-only (Cookie-Session via hooks.server.ts). Der Client
// schickt die laufende Konversation, der Server fährt einen Agenten-Loop und
// liefert die nächste Rückfrage/Zusammenfassung + ob geschrieben wurde.
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet.');
	const trace = traceId();
	const startedAt = Date.now();
	const body = await request.json().catch(() => null);
	const messages = body?.messages as Msg[] | undefined;
	if (!Array.isArray(messages)) throw error(400, 'messages[] erforderlich.');
	logNarrateRoute('info', 'request.start', {
		traceId: trace,
		userId: locals.user.id,
		messageCount: messages.length
	});
	const [apiKey, model, autoApprove] = await Promise.all([
		getSetting(locals.user.id, SETTING_KEYS.openRouterApiKey),
		getSetting(locals.user.id, SETTING_KEYS.openRouterModel),
		getBoolSetting(locals.user.id, SETTING_KEYS.narrateAutoApprove, false)
	]);
	try {
		const result = await runNarration(messages, { apiKey: apiKey ?? undefined, model: model ?? undefined, autoApprove });
		logNarrateRoute('info', 'request.done', {
			traceId: trace,
			userId: locals.user.id,
			durationMs: Date.now() - startedAt,
			messageCount: messages.length,
			replyChars: result.reply.length,
			wrote: result.wrote
		});
		return json(result);
	} catch (e) {
		logNarrateRoute('error', 'request.failed', {
			traceId: trace,
			userId: locals.user.id,
			durationMs: Date.now() - startedAt,
			messageCount: messages.length,
			error: e instanceof Error ? e.message : String(e)
		});
		throw error(500, e instanceof Error ? e.message : 'Erzählung fehlgeschlagen.');
	}
};

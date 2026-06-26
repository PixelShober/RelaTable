import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const MAX_FIELD_LENGTH = 500;
const ALLOWED_FIELDS = new Set([
	'event',
	'path',
	'userAgent',
	'speechRecognition',
	'errorCode',
	'errorMessage',
	'errorName',
	'phase',
	'hadTranscript'
]);

function sanitizeValue(value: unknown) {
	if (typeof value === 'string') return value.slice(0, MAX_FIELD_LENGTH);
	if (typeof value === 'number' || typeof value === 'boolean' || value == null) return value;
	return String(value).slice(0, MAX_FIELD_LENGTH);
}

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Nicht angemeldet.');
	const body = await request.json().catch(() => null);
	if (!body || typeof body !== 'object') throw error(400, 'JSON body erforderlich.');
	const rawEvent = 'event' in body ? String((body as Record<string, unknown>).event) : '';
	if (!rawEvent || rawEvent.length > 100) throw error(400, 'event erforderlich.');

	const fields: Record<string, unknown> = {};
	for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
		if (!ALLOWED_FIELDS.has(key)) continue;
		fields[key] = sanitizeValue(value);
	}
	console.info(
		JSON.stringify({
			scope: 'relatable:client',
			ts: new Date().toISOString(),
			userId: locals.user.id,
			...fields
		})
	);
	return json({ ok: true });
};

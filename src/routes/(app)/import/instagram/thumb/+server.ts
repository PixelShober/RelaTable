import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// IG-Profilbilder kommen von diesen CDNs. Allowlist gegen SSRF — wir proxyen keine beliebigen URLs.
const ALLOWED_HOSTS = /(^|\.)(cdninstagram\.com|fbcdn\.net)$/;

// Browser können cdninstagram-URLs nicht hotlinken (IG blockt fremde Origins); daher serverseitig holen
// und durchreichen — derselbe Fetch wie beim Import, nur gestreamt statt gespeichert.
export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) throw error(401, 'unauthenticated');
	const target = url.searchParams.get('u') ?? '';
	let parsed: URL;
	try {
		parsed = new URL(target);
	} catch {
		throw error(400, 'bad url');
	}
	if (parsed.protocol !== 'https:' || !ALLOWED_HOSTS.test(parsed.hostname)) throw error(400, 'host not allowed');

	const res = await fetch(parsed, { signal: AbortSignal.timeout(15000) });
	if (!res.ok || !res.body) throw error(502, 'fetch failed');
	return new Response(res.body, {
		headers: {
			'content-type': res.headers.get('content-type') ?? 'image/jpeg',
			'cache-control': 'private, max-age=3600'
		}
	});
};

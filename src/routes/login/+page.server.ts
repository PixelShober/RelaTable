import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { verifyPassword, createSession, setSessionCookie } from '$lib/server/auth';
import type { Actions } from './$types';

// Generic failure message — no user enumeration (AC-010/011).
const GENERIC = 'Anmeldung fehlgeschlagen.';

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const data = await request.formData();
		const password = String(data.get('password') ?? '');
		const remember = data.get('remember') === 'on';
		const redirectTo = sanitizeRedirect(String(data.get('redirect') ?? url.searchParams.get('redirect') ?? ''));

		const user = await db.appUser.findFirst();
		if (!user) throw redirect(303, '/setup');

		const ok = password.length > 0 && (await verifyPassword(user.passwordHash, password));
		if (!ok) return fail(401, { error: GENERIC });

		const { id, expiresAt } = await createSession(user.id, remember);
		setSessionCookie(cookies, id, expiresAt);
		throw redirect(303, redirectTo || '/graph');
	}
};

// Only allow internal, single-segment-leading redirects.
function sanitizeRedirect(target: string): string {
	try {
		const decoded = decodeURIComponent(target);
		if (decoded.startsWith('/') && !decoded.startsWith('//')) return decoded;
	} catch {
		/* ignore */
	}
	return '';
}

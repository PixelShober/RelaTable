import { redirect } from '@sveltejs/kit';
import { destroySession, clearSessionCookie } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	throw redirect(303, '/graph');
};

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (locals.sessionId) await destroySession(locals.sessionId);
		clearSessionCookie(cookies);
		throw redirect(303, '/login');
	}
};

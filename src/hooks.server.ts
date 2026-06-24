import { redirect, type Handle } from '@sveltejs/kit';
import { resolveSession, ownerExists } from '$lib/server/auth';

// ponytail: /api/mcp authed via Bearer-Token (checkBearer in mcp.ts), nicht über Cookie-Session.
const PUBLIC_PATHS = ['/login', '/setup'];
const PUBLIC_PREFIXES = ['/api/mcp'];

export const handle: Handle = async ({ event, resolve }) => {
	const { user, sessionId } = await resolveSession(event.cookies);
	event.locals.user = user;
	event.locals.sessionId = sessionId;

	const path = event.url.pathname;
	const isApiOrPage = !path.startsWith('/_app') && !path.startsWith('/favicon');

	if (isApiOrPage) {
		const hasOwner = await ownerExists();

		// First run: no owner yet → force setup (except setup itself).
		if (!hasOwner && path !== '/setup') {
			throw redirect(303, '/setup');
		}
		// Owner exists: setup is closed.
		if (hasOwner && path === '/setup') {
			throw redirect(303, user ? '/graph' : '/login');
		}
		// Protected area: must be authenticated.
		if (hasOwner && !user && !PUBLIC_PATHS.includes(path) && !PUBLIC_PREFIXES.some((p) => path.startsWith(p))) {
			const target = encodeURIComponent(path + event.url.search);
			throw redirect(303, `/login?redirect=${target}`);
		}
		// Already logged in but visiting login → go to app.
		if (user && path === '/login') {
			throw redirect(303, '/graph');
		}
	}

	return resolve(event);
};

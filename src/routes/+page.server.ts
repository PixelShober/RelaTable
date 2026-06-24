import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	// hooks.server.ts handles auth/first-run; authenticated users land on the graph.
	throw redirect(303, '/graph');
};

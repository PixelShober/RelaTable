import { fail, redirect } from '@sveltejs/kit';
import { loadGraph } from '$lib/server/queries';
import { mergePersons } from '$lib/server/persons';
import { db } from '$lib/server/db';
import { TYPE_COLORS } from '$lib/domain/relationships';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const graph = await loadGraph(locals.user!.id);
	const focus = url.searchParams.get('focus');
	const focusId = focus && /^\d+$/.test(focus) ? Number(focus) : null;

	// Legend entries (the four primary edge types shown in SCR-020).
	const legend = [
		{ label: 'Bekanntschaft', color: TYPE_COLORS['Bekanntschaft'] },
		{ label: 'Freundschaft', color: TYPE_COLORS['Freundschaft'] },
		{ label: 'Enge Freundschaft', color: TYPE_COLORS['Enge Freundschaft'] },
		{ label: 'Romantik', color: TYPE_COLORS['Romantik'] }
	];

	return { graph, focusId, legend };
};

export const actions: Actions = {
	merge: async ({ locals, request }) => {
		const data = await request.formData();
		const sourceId = Number(data.get('sourceId'));
		const targetId = Number(data.get('targetId'));
		if (!Number.isInteger(sourceId) || !Number.isInteger(targetId)) {
			return fail(400, { mergeError: 'Ungültige Personen-Auswahl.' });
		}

		try {
			await mergePersons(db, locals.user!.id, targetId, sourceId);
		} catch (e) {
			return fail(400, { mergeError: e instanceof Error ? e.message : 'Merge fehlgeschlagen.' });
		}
		throw redirect(303, `/graph?focus=${targetId}`);
	}
};

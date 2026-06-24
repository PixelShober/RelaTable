import { loadGraph } from '$lib/server/queries';
import { TYPE_COLORS } from '$lib/domain/relationships';
import type { PageServerLoad } from './$types';

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

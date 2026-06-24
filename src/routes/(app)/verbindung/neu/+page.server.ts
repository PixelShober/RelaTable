import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { getOrCreateConnection, startType } from '$lib/server/relationshipService';
import { parseImprecise } from '$lib/server/impreciseTime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const ownerId = locals.user!.id;
	const fromId = Number(url.searchParams.get('from'));
	const from = await db.person.findFirst({ where: { id: fromId, ownerId } });
	if (!from) throw error(404, 'Person nicht gefunden');

	const [others, types] = await Promise.all([
		db.person.findMany({ where: { ownerId, id: { not: fromId } }, select: { id: true, name: true }, orderBy: { name: 'asc' } }),
		db.relationshipType.findMany({ where: { isActive: true }, include: { category: true }, orderBy: { id: 'asc' } })
	]);

	return {
		from: { id: from.id, name: from.name },
		others,
		types: types.map((t) => ({ id: t.id, name: t.name, category: t.category.name }))
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const ownerId = locals.user!.id;
		const fd = await request.formData();
		const fromId = Number(fd.get('fromId'));
		const toId = Number(fd.get('toId'));
		const typeId = Number(fd.get('typeId'));
		if (!toId) return fail(400, { error: 'Bitte eine zweite Person wählen.' });

		const conn = await getOrCreateConnection(ownerId, fromId, toId);
		if (!conn.ok) return fail(400, { error: conn.message ?? 'Verbindung fehlgeschlagen.' });

		if (typeId) {
			const res = await startType(ownerId, conn.connectionId!, typeId, parseImprecise(fd, 'when'));
			if (!res.ok) return fail(400, { error: res.message ?? res.error ?? 'Typ konnte nicht gesetzt werden.' });
		}
		throw redirect(303, `/pair/${fromId}-${toId}`);
	}
};

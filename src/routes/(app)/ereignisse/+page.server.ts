import { db } from '$lib/server/db';
import { formatImprecise, type TimeKind } from '$lib/domain/time';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const ownerId = locals.user!.id;
	const q = url.searchParams.get('q')?.trim() ?? '';
	const typ = url.searchParams.get('typ')?.trim() ?? '';

	const events = await db.event.findMany({
		where: {
			ownerId,
			...(q ? { name: { contains: q } } : {}),
			...(typ ? { eventType: { is: { name: typ } } } : {})
		},
		include: { eventType: true, location: true, participants: { include: { person: { select: { name: true } } } } },
		orderBy: [{ occurredAt: 'desc' }, { id: 'desc' }]
	});

	const items = events.map((e) => {
		const names = e.participants.map((p) => p.person.name);
		const shown = names.slice(0, 2).join(', ');
		const extra = names.length > 2 ? ` +${names.length - 2}` : '';
		return {
			id: e.id,
			name: e.name,
			typeName: e.eventType.name,
			sensitive: e.eventType.sensitivity === 'sensitive',
			when: formatImprecise({ kind: e.occurredAtKind as TimeKind, date: e.occurredAt, text: e.occurredAtText }),
			city: e.location?.city ?? null,
			participants: shown + extra
		};
	});

	const typeOptions = (await db.eventType.findMany({ orderBy: { name: 'asc' } })).map((t) => t.name);
	return { items, q, typ, typeOptions };
};

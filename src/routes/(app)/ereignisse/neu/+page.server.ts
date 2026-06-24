import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { createEvent } from '$lib/server/eventService';
import { parseImprecise } from '$lib/server/impreciseTime';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const ownerId = locals.user!.id;
	const [eventTypes, persons] = await Promise.all([
		db.eventType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
		db.person.findMany({ where: { ownerId }, select: { id: true, name: true }, orderBy: { name: 'asc' } })
	]);
	// Optional prefilled participants via ?with=1,2
	const withParam = url.searchParams.get('with');
	const prefill = withParam ? withParam.split(',').map(Number).filter((n) => Number.isInteger(n)) : [];
	return { eventTypes, persons, prefill };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const fd = await request.formData();
		const result = await createEvent(locals.user!.id, {
			name: String(fd.get('name') ?? ''),
			eventTypeId: Number(fd.get('eventTypeId')),
			time: parseImprecise(fd, 'when'),
			city: String(fd.get('city') ?? ''),
			participantIds: fd.getAll('participantIds').map(Number),
			note: String(fd.get('note') ?? '')
		});
		if (!result.ok) return fail(400, { error: result.error });
		throw redirect(303, `/ereignisse/${result.eventId}`);
	}
};

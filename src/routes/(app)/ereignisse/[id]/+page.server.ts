import { error, fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { updateEvent, deleteEvent } from '$lib/server/eventService';
import { parseImprecise } from '$lib/server/impreciseTime';
import type { TimeKind } from '$lib/domain/time';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	const ownerId = locals.user!.id;
	const id = Number(params.id);
	const event = await db.event.findFirst({
		where: { id, ownerId },
		include: { eventType: true, location: true, participants: true }
	});
	if (!event) throw error(404, 'Ereignis nicht gefunden');

	const [eventTypes, persons] = await Promise.all([
		db.eventType.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } }),
		db.person.findMany({ where: { ownerId }, select: { id: true, name: true }, orderBy: { name: 'asc' } })
	]);

	// Reconstruct the date input value for the active kind.
	const kind = event.occurredAtKind as TimeKind;
	let dateStr = '';
	if (event.occurredAt) {
		const d = event.occurredAt;
		if (kind === 'day') dateStr = d.toISOString().slice(0, 10);
		else if (kind === 'month') dateStr = d.toISOString().slice(0, 7);
		else if (kind === 'year') dateStr = String(d.getUTCFullYear());
	}

	return {
		eventTypes,
		persons,
		initial: {
			name: event.name,
			eventTypeId: event.eventTypeId,
			whenKind: kind,
			whenDate: dateStr,
			whenText: event.occurredAtText ?? '',
			city: event.location?.city ?? '',
			participantIds: event.participants.map((p) => p.personId),
			note: event.note ?? ''
		},
		eventId: event.id
	};
};

export const actions: Actions = {
	update: async ({ request, locals, params }) => {
		const fd = await request.formData();
		const result = await updateEvent(locals.user!.id, Number(params.id), {
			name: String(fd.get('name') ?? ''),
			eventTypeId: Number(fd.get('eventTypeId')),
			time: parseImprecise(fd, 'when'),
			city: String(fd.get('city') ?? ''),
			participantIds: fd.getAll('participantIds').map(Number),
			note: String(fd.get('note') ?? '')
		});
		if (!result.ok) return fail(400, { error: result.error });
		throw redirect(303, `/ereignisse`);
	},

	delete: async ({ locals, params }) => {
		await deleteEvent(locals.user!.id, Number(params.id));
		throw redirect(303, '/ereignisse');
	}
};

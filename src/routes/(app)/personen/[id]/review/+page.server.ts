import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { currentTypeName } from '$lib/domain/relationships';
import { formatImprecise } from '$lib/domain/time';
import { loadRelTypes, toPeriods } from '$lib/server/queries';
import type { PageServerLoad } from './$types';

type ReviewItem = {
	id: string;
	kind: 'profile' | 'connection' | 'event';
	severity: 'todo' | 'hint';
	title: string;
	detail: string;
	href?: string;
};

function missingProfileFields(person: {
	id: number;
	name: string;
	dateOfBirth: Date | null;
	gender: string | null;
	locationId: number | null;
	notes: string | null;
	profileImagePath: string | null;
	profileImageUrl: string | null;
}): ReviewItem[] {
	const missing = [
		!person.dateOfBirth ? 'Geburtstag' : null,
		!person.gender ? 'Geschlecht' : null,
		!person.locationId ? 'Ort' : null,
		!person.notes?.trim() ? 'Notiz' : null,
		!person.profileImagePath && !person.profileImageUrl ? 'Profilbild' : null
	].filter(Boolean);
	if (!missing.length) return [];
	return [
		{
			id: `profile-${person.id}`,
			kind: 'profile',
			severity: person.notes?.trim() ? 'hint' : 'todo',
			title: `${person.name}: Profil ergänzen`,
			detail: `Offen: ${missing.join(', ')}.`,
			href: `/personen/${person.id}/bearbeiten?return=review`
		}
	];
}

function pairKey(a: number, b: number): string {
	return a < b ? `${a}-${b}` : `${b}-${a}`;
}

export const load: PageServerLoad = async ({ locals, params }) => {
	const ownerId = locals.user!.id;
	const id = Number(params.id);
	if (!Number.isInteger(id)) throw error(404, 'Person nicht gefunden');

	const [person, relTypes] = await Promise.all([
		db.person.findFirst({
			where: { id, ownerId },
			include: { location: true }
		}),
		loadRelTypes()
	]);
	if (!person) throw error(404, 'Person nicht gefunden');

	const [connections, participations] = await Promise.all([
		db.connection.findMany({
			where: { ownerId, OR: [{ personLowId: id }, { personHighId: id }] },
			include: {
				personLow: true,
				personHigh: true,
				periods: { select: { relationshipTypeId: true, validFrom: true, validTo: true } },
				journal: { select: { id: true } }
			}
		}),
		db.eventParticipant.findMany({
			where: { personId: id },
			include: {
				event: {
					include: {
						eventType: true,
						participants: { include: { person: true } }
					}
				}
			}
		})
	]);

	const items: ReviewItem[] = [...missingProfileFields(person)];
	const connectedIds = new Set<number>();
	const connectedPairKeys = new Set<string>();

	for (const connection of connections) {
		const other = connection.personLowId === id ? connection.personHigh : connection.personLow;
		connectedIds.add(other.id);
		connectedPairKeys.add(pairKey(id, other.id));
		items.push(...missingProfileFields(other).map((item) => ({ ...item, severity: 'hint' as const })));

		const typeName = currentTypeName(toPeriods(connection.periods), relTypes);
		if (!typeName) {
			items.push({
				id: `connection-type-${connection.id}`,
				kind: 'connection',
				severity: 'todo',
				title: `Verbindung zu ${other.name}: Typ klären`,
				detail: 'Es gibt eine direkte Verbindung, aber keinen aktiven Beziehungstyp.',
				href: `/pair/${id}-${other.id}`
			});
		}
		if (connection.journal.length === 0) {
			items.push({
				id: `connection-journal-${connection.id}`,
				kind: 'connection',
				severity: 'hint',
				title: `Verbindung zu ${other.name}: Kontext ergänzen`,
				detail: 'Es gibt noch keinen Tagebuch-/Kontext-Eintrag zu dieser Verbindung.',
				href: `/pair/${id}-${other.id}`
			});
		}
	}

	const eventPeerMap = new Map<number, { name: string; eventNames: string[] }>();
	const events = participations
		.map(({ event }) => ({
			id: event.id,
			name: event.name,
			typeName: event.eventType.name,
			when: formatImprecise({ kind: event.occurredAtKind as never, date: event.occurredAt, text: event.occurredAtText }),
			participants: event.participants.map((p) => ({ id: p.person.id, name: p.person.name }))
		}))
		.sort((a, b) => a.name.localeCompare(b.name, 'de'));

	for (const event of events) {
		for (const participant of event.participants) {
			if (participant.id === id || connectedPairKeys.has(pairKey(id, participant.id))) continue;
			const entry = eventPeerMap.get(participant.id) ?? { name: participant.name, eventNames: [] };
			entry.eventNames.push(event.name);
			eventPeerMap.set(participant.id, entry);
		}
	}

	for (const [personId, peer] of eventPeerMap) {
		items.push({
			id: `event-peer-${personId}`,
			kind: 'event',
			severity: 'todo',
			title: `Verbindung zu ${peer.name} prüfen`,
			detail: `${person.name} und ${peer.name} kommen gemeinsam in ${peer.eventNames.length === 1 ? `„${peer.eventNames[0]}"` : `${peer.eventNames.length} Ereignissen`} vor, haben aber keine direkte Verbindung. Wie ist ihre allgemeine Beziehung?`,
			href: `/verbindung/neu?from=${id}`
		});
	}

	const uniqueItems = Array.from(new Map(items.map((item) => [item.id, item])).values());
	const directContacts = connections.map((connection) => {
		const other = connection.personLowId === id ? connection.personHigh : connection.personLow;
		const typeName = currentTypeName(toPeriods(connection.periods), relTypes);
		return {
			id: other.id,
			name: other.name,
			typeName,
			journalCount: connection.journal.length
		};
	});

	return {
		person: { id: person.id, name: person.name, city: person.location?.city ?? null },
		items: uniqueItems,
		stats: {
			directContacts: connectedIds.size,
			events: events.length,
			openTodos: uniqueItems.filter((item) => item.severity === 'todo').length,
			hints: uniqueItems.filter((item) => item.severity === 'hint').length
		},
		directContacts,
		events
	};
};

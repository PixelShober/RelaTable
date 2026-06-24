import { db } from '$lib/server/db';
import { loadRelTypes, toPeriods } from '$lib/server/queries';
import { currentTypeName } from '$lib/domain/relationships';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const ownerId = locals.user!.id;
	const q = url.searchParams.get('q')?.trim() ?? '';
	const ort = (url.searchParams.get('ort') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
	const typ = (url.searchParams.get('typ') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
	const sort = url.searchParams.get('sort') === 'desc' ? 'desc' : 'asc';

	const [persons, connections, types] = await Promise.all([
		db.person.findMany({
			where: {
				ownerId,
				...(q ? { name: { contains: q } } : {}),
				...(ort.length ? { location: { is: { city: { in: ort } } } } : {})
			},
			include: { location: true },
			orderBy: { name: sort }
		}),
		db.connection.findMany({
			where: { ownerId },
			include: { periods: { select: { relationshipTypeId: true, validFrom: true, validTo: true } } }
		}),
		loadRelTypes()
	]);

	// Per-person degree + set of current type names across their connections.
	const degree = new Map<number, number>();
	const typeNames = new Map<number, Set<string>>();
	for (const c of connections) {
		degree.set(c.personLowId, (degree.get(c.personLowId) ?? 0) + 1);
		degree.set(c.personHighId, (degree.get(c.personHighId) ?? 0) + 1);
		const cur = currentTypeName(toPeriods(c.periods), types);
		if (cur) {
			for (const pid of [c.personLowId, c.personHighId]) {
				if (!typeNames.has(pid)) typeNames.set(pid, new Set());
				typeNames.get(pid)!.add(cur);
			}
		}
	}

	let items = persons.map((p) => ({
		id: p.id,
		name: p.name,
		city: p.location?.city ?? null,
		image: p.profileImagePath ? `/uploads/${p.profileImagePath}` : p.profileImageUrl,
		degree: degree.get(p.id) ?? 0
	}));

	if (typ.length) {
		const keep = new Set(
			persons.filter((p) => typ.some((t) => typeNames.get(p.id)?.has(t))).map((p) => p.id)
		);
		items = items.filter((i) => keep.has(i.id));
	}

	// Distinct cities + active type names for filter UI.
	const cities = [...new Set(persons.map((p) => p.location?.city).filter((c): c is string => !!c))].sort();
	const typeOptions = types.map((t) => t.name);

	const total = await db.person.count({ where: { ownerId } });

	return { items, q, ort, typ, sort, cities, typeOptions, total };
};

import type { Prisma } from '@prisma/client';
import { db } from './db';

/** Either the shared client or a transaction client — both expose `location`. */
type LocationClient = Pick<Prisma.TransactionClient, 'location'>;

// Offline coordinate table for common German-speaking cities so the map works
// without an online geocoder (DEC-012 — city/region precision is enough).
const CITY_COORDS: Record<string, [number, number]> = {
	berlin: [52.52, 13.405],
	hamburg: [53.5511, 9.9937],
	münchen: [48.1351, 11.582],
	muenchen: [48.1351, 11.582],
	munich: [48.1351, 11.582],
	köln: [50.9375, 6.9603],
	koeln: [50.9375, 6.9603],
	frankfurt: [50.1109, 8.6821],
	leipzig: [51.3397, 12.3731],
	stuttgart: [48.7758, 9.1829],
	dresden: [51.0504, 13.7373],
	düsseldorf: [51.2277, 6.7735],
	duesseldorf: [51.2277, 6.7735],
	hannover: [52.3759, 9.732],
	nürnberg: [49.4521, 11.0767],
	nuernberg: [49.4521, 11.0767],
	bremen: [53.0793, 8.8017],
	wien: [48.2082, 16.3738],
	zürich: [47.3769, 8.5417],
	zuerich: [47.3769, 8.5417]
};

export function coordsFor(city: string): [number, number] | null {
	const k = city.trim().toLowerCase();
	// Exact match, else first token so "Frankfurt am Main" / "Berlin, DE" resolve to the base city.
	// ponytail: token-prefix only; truly multi-word names ("Bad Homburg") fall through → no coords. Upgrade: online geocoder.
	return CITY_COORDS[k] ?? CITY_COORDS[k.split(/[\s,]/)[0]] ?? null;
}

/**
 * Find an existing Location by displayName (city) or create one, attaching coords if known.
 * Pass a transaction client to keep the write inside an enclosing transaction (JSON import preview).
 */
export async function findOrCreateLocation(cityRaw: string, client: LocationClient = db): Promise<number | null> {
	const city = cityRaw.trim();
	if (!city) return null;
	const existing = await client.location.findFirst({ where: { displayName: city } });
	if (existing) return existing.id;
	const c = coordsFor(city);
	const loc = await client.location.create({
		data: {
			displayName: city,
			city,
			country: null,
			latitude: c?.[0] ?? null,
			longitude: c?.[1] ?? null,
			precision: 'city'
		}
	});
	return loc.id;
}

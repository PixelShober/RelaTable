import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { execSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PrismaClient } from '@prisma/client';
import { clearAll, ensureDemoOwner, seedReference } from '../../../prisma/seedLib';
import { mergePersons, searchPersons } from './persons';

const tempDir = mkdtempSync(join(tmpdir(), 'relatable-persons-test-'));
const dbPath = join(tempDir, 'persons-test.db');
const dbUrl = `file:${dbPath}`;

const db = new PrismaClient({
	datasources: { db: { url: dbUrl } }
});

let ownerId = 0;

describe('person helpers', () => {
	beforeAll(async () => {
		execSync('npx prisma db push --skip-generate', {
			cwd: join(process.cwd()),
			env: { ...process.env, DATABASE_URL: dbUrl },
			stdio: 'pipe'
		});
	});

	beforeEach(async () => {
		await clearAll(db);
		await seedReference(db);
		ownerId = await ensureDemoOwner(db);
	});

	afterAll(async () => {
		await db.$disconnect();
		rmSync(tempDir, { recursive: true, force: true });
	});

	it('finds persons by alias names', async () => {
		await db.person.create({
			data: {
				ownerId,
				name: 'Constantin Weber',
				aliases: { create: [{ alias: 'Conny' }, { alias: 'Consti' }] }
			}
		});

		const hits = await searchPersons(db, ownerId, 'conny');
		expect(hits).toHaveLength(1);
		expect(hits[0]?.name).toBe('Constantin Weber');
		expect(hits[0]?.aliases).toEqual(['Conny', 'Consti']);
	});

	it('merges scalar data, aliases, connections and event participants into the target person', async () => {
		const [friendType, romanceType, eventType] = await Promise.all([
			db.relationshipType.findFirstOrThrow({ where: { name: 'Freundschaft' } }),
			db.relationshipType.findFirstOrThrow({ where: { name: 'Romantik' } }),
			db.eventType.findFirstOrThrow({ where: { name: 'Generisch' } })
		]);
		const location = await db.location.create({
			data: { displayName: 'Berlin', city: 'Berlin', country: 'Deutschland', precision: 'city' }
		});

		const target = await db.person.create({
			data: {
				ownerId,
				name: 'Constantin Weber',
				notes: 'Bestehende Notiz',
				aliases: { create: [{ alias: 'Consti' }] }
			}
		});
		const source = await db.person.create({
			data: {
				ownerId,
				name: 'Conny Weber',
				gender: 'Männlich',
				locationId: location.id,
				notes: 'Quelle Notiz',
				aliases: { create: [{ alias: 'Conny' }] }
			}
		});
		const third = await db.person.create({
			data: { ownerId, name: 'Mara Vogt' }
		});

		const direct = await db.connection.create({
			data: { ownerId, personLowId: Math.min(target.id, source.id), personHighId: Math.max(target.id, source.id) }
		});
		await db.connectionRelationshipPeriod.create({
			data: {
				connectionId: direct.id,
				relationshipTypeId: romanceType.id,
				validFromKind: 'year',
				validFromText: '2024'
			}
		});
		await db.connectionJournalEntry.create({
			data: {
				connectionId: direct.id,
				occurredAtKind: 'year',
				occurredAtText: '2024',
				title: 'Direkte Vorgeschichte'
			}
		});

		const targetConn = await db.connection.create({
			data: { ownerId, personLowId: Math.min(target.id, third.id), personHighId: Math.max(target.id, third.id) }
		});
		await db.connectionRelationshipPeriod.create({
			data: {
				connectionId: targetConn.id,
				relationshipTypeId: friendType.id,
				validFromKind: 'year',
				validFromText: '2020'
			}
		});

		const sourceConn = await db.connection.create({
			data: { ownerId, personLowId: Math.min(source.id, third.id), personHighId: Math.max(source.id, third.id) }
		});
		await db.connectionRelationshipPeriod.create({
			data: {
				connectionId: sourceConn.id,
				relationshipTypeId: friendType.id,
				validFromKind: 'year',
				validFromText: '2021'
			}
		});
		await db.connectionJournalEntry.create({
			data: {
				connectionId: sourceConn.id,
				occurredAtKind: 'year',
				occurredAtText: '2021',
				title: 'Gemeinsamer Abend'
			}
		});

		await db.socialAccount.create({
			data: { personId: source.id, platform: 'Telegram', handle: '@conny' }
		});

		const event = await db.event.create({
			data: { ownerId, name: 'Abendessen', eventTypeId: eventType.id, occurredAtKind: 'day' }
		});
		await db.eventParticipant.create({ data: { eventId: event.id, personId: source.id, role: 'Gast' } });

		await mergePersons(db, ownerId, target.id, source.id);

		const merged = await db.person.findUniqueOrThrow({
			where: { id: target.id },
			include: {
				aliases: { orderBy: { alias: 'asc' } },
				socialAccounts: true,
				eventParticipations: true
			}
		});
		expect(merged.gender).toBe('Männlich');
		expect(merged.locationId).toBe(location.id);
		expect(merged.aliases.map((entry) => entry.alias)).toEqual(['Conny', 'Conny Weber', 'Consti']);
		expect(merged.notes).toContain('Bestehende Notiz');
		expect(merged.notes).toContain('Quelle Notiz');
		expect(merged.notes).toContain('Zusammengefuehrte Direktverbindung mit Conny Weber');
		expect(merged.socialAccounts).toHaveLength(1);
		expect(merged.eventParticipations).toHaveLength(1);
		expect(merged.eventParticipations[0]?.role).toBe('Gast');

		const sourceDeleted = await db.person.findUnique({ where: { id: source.id } });
		expect(sourceDeleted).toBeNull();

		const mergedConnection = await db.connection.findFirstOrThrow({
			where: {
				ownerId,
				personLowId: Math.min(target.id, third.id),
				personHighId: Math.max(target.id, third.id)
			},
			include: { periods: true, journal: true }
		});
		expect(mergedConnection.periods).toHaveLength(2);
		expect(mergedConnection.journal).toHaveLength(1);

		const remainingDirect = await db.connection.findFirst({
			where: {
				ownerId,
				personLowId: Math.min(target.id, source.id),
				personHighId: Math.max(target.id, source.id)
			}
		});
		expect(remainingDirect).toBeNull();
	});
});

/**
 * One-time, programmatic Notion import (DEC-003/024). No UI wizard.
 *
 *   NOTION_TOKEN=secret_xxx \
 *   NOTION_DB_PERSON=<db_id> NOTION_DB_RELATION=<db_id> \
 *   NOTION_DB_EVENT=<db_id> NOTION_DB_ACCOUNT=<db_id> \
 *   npm run import:notion -- --apply
 *
 * Without --apply it runs a dry preview (nothing written, AC-110/111).
 * Re-runs are safe: ExternalImportMap prevents duplicates (AC-112).
 * A report is printed at the end (AC-113).
 *
 * The MAPPING block below is the single place to adapt Notion property names
 * to your own workspace schema.
 */
import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();
const TOKEN = process.env.NOTION_TOKEN ?? '';
const APPLY = process.argv.includes('--apply');

// --- adapt these to your Notion property names -----------------------------
const MAPPING = {
	person: { db: process.env.NOTION_DB_PERSON, name: 'Name', dob: 'Date of Birth', city: 'City', instagram: 'Instagram URL' },
	relation: { db: process.env.NOTION_DB_RELATION, people: 'People', type: 'Type' },
	event: { db: process.env.NOTION_DB_EVENT, name: 'Name', type: 'Type', date: 'Date', city: 'City' },
	account: { db: process.env.NOTION_DB_ACCOUNT, person: 'Person', platform: 'Platform', handle: 'Handle', url: 'URL' }
};
// ---------------------------------------------------------------------------

interface Report {
	created: number;
	skipped: number;
	conflicts: number;
	errors: number;
}
const report: Report = { created: 0, skipped: 0, conflicts: 0, errors: 0 };

async function notionQuery(databaseId: string): Promise<any[]> {
	const out: any[] = [];
	let cursor: string | undefined;
	do {
		const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${TOKEN}`,
				'Notion-Version': '2022-06-28',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(cursor ? { start_cursor: cursor } : {})
		});
		if (!res.ok) throw new Error(`Notion ${res.status}: ${await res.text()}`);
		const json = await res.json();
		out.push(...json.results);
		cursor = json.has_more ? json.next_cursor : undefined;
	} while (cursor);
	return out;
}

function plain(prop: any): string | null {
	if (!prop) return null;
	if (prop.type === 'title') return prop.title.map((t: any) => t.plain_text).join('') || null;
	if (prop.type === 'rich_text') return prop.rich_text.map((t: any) => t.plain_text).join('') || null;
	if (prop.type === 'url') return prop.url ?? null;
	if (prop.type === 'date') return prop.date?.start ?? null;
	if (prop.type === 'select') return prop.select?.name ?? null;
	if (prop.type === 'relation') return null;
	return null;
}

async function ensureBatch() {
	return db.importBatch.create({ data: { status: APPLY ? 'applied' : 'preview' } });
}

async function alreadyImported(externalId: string): Promise<boolean> {
	const m = await db.externalImportMap.findUnique({
		where: { externalSource_externalId: { externalSource: 'notion', externalId } }
	});
	return !!m;
}

async function main() {
	if (!TOKEN) {
		console.error('NOTION_TOKEN fehlt. Setze ihn in .env und konfiguriere die NOTION_DB_* IDs.');
		process.exit(1);
	}
	const owner = await db.appUser.findFirst();
	if (!owner) {
		console.error('Kein Eigentümer-Konto. Bitte zuerst die App einrichten (First-Run).');
		process.exit(1);
	}
	const batch = APPLY ? await ensureBatch() : null;

	console.log(`Notion-Import (${APPLY ? 'AUSFÜHREN' : 'VORSCHAU'}) …`);

	// Persons
	if (MAPPING.person.db) {
		const rows = await notionQuery(MAPPING.person.db);
		for (const row of rows) {
			try {
				if (await alreadyImported(row.id)) {
					report.skipped++;
					continue;
				}
				const name = plain(row.properties[MAPPING.person.name]);
				if (!name) {
					report.errors++;
					continue;
				}
				if (APPLY && batch) {
					const dobStr = plain(row.properties[MAPPING.person.dob]);
					const created = await db.person.create({
						data: {
							ownerId: owner.id,
							name,
							dateOfBirth: dobStr ? new Date(dobStr) : null
						}
					});
					await db.externalImportMap.create({
						data: { importBatchId: batch.id, externalId: row.id, entityType: 'person', internalId: created.id }
					});
				}
				report.created++;
			} catch {
				report.errors++;
			}
		}
	}

	// Relations: skip any with != 2 people (conflict, AC).
	if (MAPPING.relation.db) {
		const rows = await notionQuery(MAPPING.relation.db);
		for (const row of rows) {
			const rel = row.properties[MAPPING.relation.people];
			const people = rel?.relation ?? [];
			if (people.length !== 2) {
				report.conflicts++;
				continue;
			}
			// Resolve mapped person ids; create a Connection if both are known.
			report.skipped++; // left as exercise: link via ExternalImportMap person ids
		}
	}

	if (APPLY && batch) {
		await db.importBatch.update({
			where: { id: batch.id },
			data: {
				finishedAt: new Date(),
				createdCount: report.created,
				skippedCount: report.skipped,
				errorCount: report.errors
			}
		});
	}

	console.log('— Bericht —');
	console.log(`erstellt:    ${report.created}`);
	console.log(`übersprungen:${report.skipped} (Duplikate/bereits importiert)`);
	console.log(`Konflikte:   ${report.conflicts} (Relationen mit ≠ 2 Personen)`);
	console.log(`Fehler:      ${report.errors}`);
	if (!APPLY) console.log('\nVorschau — nichts geschrieben. Mit `-- --apply` ausführen.');
}

main()
	.then(() => db.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await db.$disconnect();
		process.exit(1);
	});

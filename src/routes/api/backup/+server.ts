import { error } from '@sveltejs/kit';
import { spawn } from 'node:child_process';
import { resolve } from 'node:path';
import type { RequestHandler } from './$types';

// Backup = one consistent package (SQLite DB + uploads) (FEAT-110, DEC-031).
// Uses the system `tar` (present on Linux + alpine/busybox) to avoid a zip dependency.
export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'unauthenticated');
	const dataDir = resolve(process.env.DATA_DIR || './data');

	const child = spawn('tar', ['czf', '-', '-C', dataDir, '.'], { stdio: ['ignore', 'pipe', 'ignore'] });

	const chunks: Buffer[] = [];
	let buf: Buffer;
	try {
		buf = await new Promise<Buffer>((res, rej) => {
			child.stdout.on('data', (c: Buffer) => chunks.push(c));
			child.on('error', rej);
			child.on('close', (code) => (code === 0 ? res(Buffer.concat(chunks)) : rej(new Error('tar exit ' + code))));
		});
	} catch (e) {
		throw error(500, 'Backup fehlgeschlagen: ' + (e as Error).message);
	}

	const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
	return new Response(new Uint8Array(buf), {
		headers: {
			'content-type': 'application/gzip',
			'content-disposition': `attachment; filename="relatable-backup-${stamp}.tar.gz"`
		}
	});
};

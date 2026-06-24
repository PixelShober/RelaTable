import { error } from '@sveltejs/kit';
import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { UPLOAD_DIR, safeUploadName } from '$lib/server/uploads';
import type { RequestHandler } from './$types';

const MIME: Record<string, string> = {
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.gif': 'image/gif'
};

export const GET: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'unauthenticated');
	const name = safeUploadName(params.file);
	if (!name) throw error(400, 'bad name');
	const path = join(UPLOAD_DIR, name);
	try {
		await stat(path);
	} catch {
		throw error(404, 'not found');
	}
	const ext = name.slice(name.lastIndexOf('.')).toLowerCase();
	const data = await readFile(path);
	return new Response(new Uint8Array(data), {
		headers: {
			'content-type': MIME[ext] ?? 'application/octet-stream',
			'cache-control': 'private, max-age=3600'
		}
	});
};

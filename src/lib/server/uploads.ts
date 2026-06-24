import { mkdir, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { randomBytes } from 'node:crypto';

const DATA_DIR = process.env.DATA_DIR || './data';
export const UPLOAD_DIR = join(DATA_DIR, 'uploads');

const ALLOWED = new Map<string, string>([
	['image/jpeg', '.jpg'],
	['image/png', '.png'],
	['image/webp', '.webp'],
	['image/gif', '.gif']
]);

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export interface UploadResult {
	ok: boolean;
	fileName?: string;
	error?: string;
}

/** Validate type + size, store under DATA_DIR/uploads, return the stored filename. */
export async function saveProfileImage(file: File): Promise<UploadResult> {
	if (!file || file.size === 0) return { ok: false, error: 'Keine Datei' };
	if (file.size > MAX_BYTES) return { ok: false, error: 'Bild zu groß (max. 5 MB)' };
	const ext = ALLOWED.get(file.type);
	if (!ext) return { ok: false, error: 'Nur JPEG/PNG/WebP/GIF erlaubt' };

	await mkdir(UPLOAD_DIR, { recursive: true });
	const name = `${Date.now()}-${randomBytes(6).toString('hex')}${ext}`;
	const buf = Buffer.from(await file.arrayBuffer());
	await writeFile(join(UPLOAD_DIR, name), buf);
	return { ok: true, fileName: name };
}

export function safeUploadName(name: string): string | null {
	// Block traversal; uploads are flat files with known extensions.
	if (!/^[\w.-]+$/.test(name)) return null;
	if (name.includes('..')) return null;
	if (!extname(name)) return null;
	return name;
}

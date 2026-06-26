import { describe, it, expect, vi } from 'vitest';

// Mock dependencies so we can test alias parsing without DB or filesystem.
vi.mock('./geo', () => ({ findOrCreateLocation: async () => 1 }));
vi.mock('./uploads', () => ({ saveProfileImage: async () => ({ ok: true, fileName: 'test.png' }) }));

import { processPersonForm } from './personForm';

function makeForm(fields: Record<string, string>): FormData {
	const fd = new FormData();
	for (const [k, v] of Object.entries(fields)) fd.set(k, v);
	return fd;
}

describe('processPersonForm – alias parsing', () => {
	it('parses comma-separated aliases', async () => {
		const result = await processPersonForm(makeForm({ name: 'Constantin', aliases: 'Conny, Consti, Con' }));
		expect(result.ok).toBe(true);
		expect(result.data?.aliases).toEqual(['Conny', 'Consti', 'Con']);
	});

	it('parses newline-separated aliases', async () => {
		const result = await processPersonForm(makeForm({ name: 'Maria', aliases: 'Mary\nMarie\nMiri' }));
		expect(result.ok).toBe(true);
		expect(result.data?.aliases).toEqual(['Mary', 'Marie', 'Miri']);
	});

	it('deduplicates aliases', async () => {
		const result = await processPersonForm(makeForm({ name: 'Tom', aliases: 'Tommy, Tommy, T' }));
		expect(result.ok).toBe(true);
		expect(result.data?.aliases).toEqual(['Tommy', 'T']);
	});

	it('excludes aliases equal to the name (case-insensitive)', async () => {
		const result = await processPersonForm(makeForm({ name: 'Jan', aliases: 'jan, JAN, Janni' }));
		expect(result.ok).toBe(true);
		expect(result.data?.aliases).toEqual(['Janni']);
	});

	it('returns empty aliases when field is blank', async () => {
		const result = await processPersonForm(makeForm({ name: 'Max', aliases: '' }));
		expect(result.ok).toBe(true);
		expect(result.data?.aliases).toEqual([]);
	});

	it('fails validation without a name', async () => {
		const result = await processPersonForm(makeForm({ name: '' }));
		expect(result.ok).toBe(false);
		expect(result.errors?.name).toBeTruthy();
	});
});

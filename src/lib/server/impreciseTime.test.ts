import { describe, it, expect } from 'vitest';
import { parseImprecise } from './impreciseTime';

function fd(entries: Record<string, string>): FormData {
	const f = new FormData();
	for (const [k, v] of Object.entries(entries)) f.set(k, v);
	return f;
}

describe('parseImprecise (form → {kind,date,text})', () => {
	it('parses an exact day', () => {
		const r = parseImprecise(fd({ when_kind: 'day', when_date: '2023-04-15' }), 'when');
		expect(r.kind).toBe('day');
		expect(r.date?.toISOString().slice(0, 10)).toBe('2023-04-15');
		expect(r.text).toBeNull();
	});

	it('parses a month to the first of that month', () => {
		const r = parseImprecise(fd({ when_kind: 'month', when_date: '2022-06' }), 'when');
		expect(r.kind).toBe('month');
		expect(r.date?.toISOString().slice(0, 10)).toBe('2022-06-01');
	});

	it('parses a year to Jan 1', () => {
		const r = parseImprecise(fd({ when_kind: 'year', when_date: '2020' }), 'when');
		expect(r.date?.getUTCFullYear()).toBe(2020);
	});

	it('keeps season/approx as text with no date', () => {
		const r = parseImprecise(fd({ when_kind: 'season', when_text: 'Sommer 2022' }), 'when');
		expect(r.kind).toBe('season');
		expect(r.date).toBeNull();
		expect(r.text).toBe('Sommer 2022');
	});

	it('treats unknown as empty', () => {
		const r = parseImprecise(fd({ when_kind: 'unknown' }), 'when');
		expect(r).toEqual({ kind: 'unknown', date: null, text: null });
	});

	it('handles empty day gracefully', () => {
		const r = parseImprecise(fd({ when_kind: 'day' }), 'when');
		expect(r.date).toBeNull();
	});
});

import { describe, it, expect } from 'vitest';
import { parseTime, normalizeGender } from './jsonImport';

describe('parseTime', () => {
	it('parses an exact day string', () => {
		const t = parseTime('2023-08-15');
		expect(t.kind).toBe('day');
		expect(t.date?.toISOString()).toBe('2023-08-15T00:00:00.000Z');
		expect(t.text).toBeNull();
	});

	it('parses a month string', () => {
		const t = parseTime('2023-08');
		expect(t.kind).toBe('month');
		expect(t.date?.toISOString()).toBe('2023-08-01T00:00:00.000Z');
	});

	it('parses a year string', () => {
		const t = parseTime('2023');
		expect(t.kind).toBe('year');
		expect(t.date?.getUTCFullYear()).toBe(2023);
	});

	it('treats free text as approx', () => {
		const t = parseTime('Sommer 2022');
		expect(t.kind).toBe('approx');
		expect(t.date).toBeNull();
		expect(t.text).toBe('Sommer 2022');
	});

	it('honours an explicit season object', () => {
		const t = parseTime({ kind: 'season', text: 'Frühjahr 2021' });
		expect(t.kind).toBe('season');
		expect(t.date).toBeNull();
		expect(t.text).toBe('Frühjahr 2021');
	});

	it('honours an explicit month object', () => {
		const t = parseTime({ kind: 'month', date: '2022-06' });
		expect(t.kind).toBe('month');
		expect(t.date?.toISOString()).toBe('2022-06-01T00:00:00.000Z');
	});

	it('returns unknown for null/empty', () => {
		expect(parseTime(null).kind).toBe('unknown');
		expect(parseTime('').kind).toBe('unknown');
	});
});

describe('normalizeGender', () => {
	it('maps synonyms to the canonical value', () => {
		expect(normalizeGender('männlich')).toBe('Männlich');
		expect(normalizeGender('m')).toBe('Männlich');
		expect(normalizeGender('female')).toBe('Weiblich');
		expect(normalizeGender('divers')).toBe('divers');
		expect(normalizeGender('nb')).toBe('divers');
	});

	it('returns null for unknown or empty', () => {
		expect(normalizeGender('alien')).toBeNull();
		expect(normalizeGender('')).toBeNull();
		expect(normalizeGender(undefined)).toBeNull();
	});
});

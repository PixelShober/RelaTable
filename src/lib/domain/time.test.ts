import { describe, it, expect } from 'vitest';
import { formatImprecise, ageFromDob } from './time';

describe('imprecise time (DEC-013)', () => {
	it('renders a season as its text, never an exact day', () => {
		expect(
			formatImprecise({ kind: 'season', date: null, text: 'Sommer 2022' })
		).toBe('Sommer 2022');
	});

	it('renders a month with month name + year', () => {
		expect(
			formatImprecise({ kind: 'month', date: new Date(Date.UTC(2022, 5, 1)), text: null })
		).toBe('Juni 2022');
	});

	it('renders a year-only value', () => {
		expect(formatImprecise({ kind: 'year', date: new Date(Date.UTC(2020, 0, 1)), text: null })).toBe(
			'2020'
		);
	});

	it('renders a day as dd.mm.yyyy', () => {
		expect(
			formatImprecise({ kind: 'day', date: new Date(Date.UTC(2023, 3, 15)), text: null })
		).toBe('15.04.2023');
	});

	it('renders unknown gracefully', () => {
		expect(formatImprecise({ kind: 'unknown', date: null, text: null })).toBe('unbekannt');
		expect(formatImprecise(null)).toBe('—');
	});
});

describe('age (DEC-014, computed not stored)', () => {
	it('computes whole years and respects birthday not yet reached', () => {
		const now = new Date(Date.UTC(2026, 5, 22));
		expect(ageFromDob(new Date(Date.UTC(1995, 0, 1)), now)).toBe(31);
		expect(ageFromDob(new Date(Date.UTC(1995, 11, 31)), now)).toBe(30);
	});

	it('returns null without a dob', () => {
		expect(ageFromDob(null)).toBeNull();
	});
});

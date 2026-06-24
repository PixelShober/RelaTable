// Imprecise time handling (DEC-013 / C-MODEL-9). A time is a pair: a *Kind plus
// either a real date or free text. The UI must never fake an exact day.

export type TimeKind = 'day' | 'month' | 'year' | 'season' | 'approx' | 'unknown';

export interface ImpreciseTime {
	kind: TimeKind;
	date: Date | null;
	text: string | null;
}

const MONTHS_DE = [
	'Januar',
	'Februar',
	'März',
	'April',
	'Mai',
	'Juni',
	'Juli',
	'August',
	'September',
	'Oktober',
	'November',
	'Dezember'
];

/** Render an imprecise time for display, honouring its precision. */
export function formatImprecise(t: ImpreciseTime | null | undefined): string {
	if (!t) return '—';
	switch (t.kind) {
		case 'unknown':
			return t.text?.trim() || 'unbekannt';
		case 'season':
		case 'approx':
			return t.text?.trim() || '—';
		case 'year':
			if (t.date) return String(t.date.getUTCFullYear());
			return t.text?.trim() || '—';
		case 'month':
			if (t.date) return `${MONTHS_DE[t.date.getUTCMonth()]} ${t.date.getUTCFullYear()}`;
			return t.text?.trim() || '—';
		case 'day':
		default:
			if (t.date) {
				const d = t.date;
				return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${d.getUTCFullYear()}`;
			}
			return t.text?.trim() || '—';
	}
}

/** A comparable instant for sorting timelines; approximate kinds fall back to text-less ordering. */
export function sortableInstant(t: ImpreciseTime | null | undefined): number {
	if (!t || !t.date) return Number.NEGATIVE_INFINITY;
	return t.date.getTime();
}

/** Compute age in whole years from a date of birth (DEC-014 — never stored). */
export function ageFromDob(dob: Date | null | undefined, now: Date = new Date()): number | null {
	if (!dob) return null;
	let age = now.getUTCFullYear() - dob.getUTCFullYear();
	const m = now.getUTCMonth() - dob.getUTCMonth();
	if (m < 0 || (m === 0 && now.getUTCDate() < dob.getUTCDate())) age--;
	return age >= 0 ? age : null;
}

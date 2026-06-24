import type { TimeKind } from '$lib/domain/time';

export interface ParsedImprecise {
	kind: TimeKind;
	date: Date | null;
	text: string | null;
}

const KINDS: TimeKind[] = ['day', 'month', 'year', 'season', 'approx', 'unknown'];

/**
 * Parse the fields emitted by ImpreciseTimeInput (prefix_kind, prefix_date, prefix_text)
 * into a normalized {kind, date, text}. UI never fakes an exact day (DEC-013).
 */
export function parseImprecise(formData: FormData, prefix: string): ParsedImprecise {
	const rawKind = String(formData.get(`${prefix}_kind`) ?? 'day');
	const kind: TimeKind = (KINDS as string[]).includes(rawKind) ? (rawKind as TimeKind) : 'day';
	const rawDate = String(formData.get(`${prefix}_date`) ?? '').trim();
	const rawText = String(formData.get(`${prefix}_text`) ?? '').trim();

	switch (kind) {
		case 'day': {
			if (!rawDate) return { kind, date: null, text: null };
			const d = new Date(rawDate + 'T00:00:00Z');
			return { kind, date: isNaN(d.getTime()) ? null : d, text: null };
		}
		case 'month': {
			// rawDate = yyyy-mm
			const m = rawDate.match(/^(\d{4})-(\d{2})$/);
			if (!m) return { kind, date: null, text: rawDate || null };
			return { kind, date: new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, 1)), text: null };
		}
		case 'year': {
			const y = rawDate.match(/^\d{4}$/);
			if (!y) return { kind, date: null, text: rawDate || null };
			return { kind, date: new Date(Date.UTC(Number(rawDate), 0, 1)), text: null };
		}
		case 'season':
		case 'approx':
			return { kind, date: null, text: rawText || null };
		case 'unknown':
		default:
			return { kind: 'unknown', date: null, text: rawText || null };
	}
}

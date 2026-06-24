import { describe, it, expect } from 'vitest';
import { classifyStatus } from './openrouterStatus';

describe('classifyStatus', () => {
	it('no key → no-key', () => {
		expect(classifyStatus({ hasKey: false })).toBe('no-key');
	});
	it('401/403 → invalid-key', () => {
		expect(classifyStatus({ hasKey: true, httpStatus: 401 })).toBe('invalid-key');
		expect(classifyStatus({ hasKey: true, httpStatus: 403 })).toBe('invalid-key');
	});
	it('non-200 (incl. undefined network failure) → error', () => {
		expect(classifyStatus({ hasKey: true, httpStatus: 500 })).toBe('error');
		expect(classifyStatus({ hasKey: true })).toBe('error');
	});
	it('200 with exhausted limit → no-credits', () => {
		expect(classifyStatus({ hasKey: true, httpStatus: 200, limitRemaining: 0 })).toBe('no-credits');
		expect(classifyStatus({ hasKey: true, httpStatus: 200, limitRemaining: -0.5 })).toBe('no-credits');
	});
	it('200 with remaining or unmetered (null) → ok', () => {
		expect(classifyStatus({ hasKey: true, httpStatus: 200, limitRemaining: 5 })).toBeNull();
		expect(classifyStatus({ hasKey: true, httpStatus: 200, limitRemaining: null })).toBeNull();
	});
});

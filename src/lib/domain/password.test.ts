import { describe, it, expect } from 'vitest';
import { checkPassword, isPasswordValid, passwordStrength, PASSWORD_MIN_LENGTH } from './password';

describe('password policy (DEC-032)', () => {
	it('requires >= 16 chars, upper, lower, digit, special', () => {
		expect(PASSWORD_MIN_LENGTH).toBe(16);
		expect(isPasswordValid('Sehr-Sicheres-Passwort9')).toBe(true);
	});

	it('rejects when a class is missing', () => {
		expect(isPasswordValid('alllowercasenospecial1')).toBe(false); // no upper, no special
		expect(isPasswordValid('NoSpecialChars1234567')).toBe(false); // no special
		expect(isPasswordValid('Short1!')).toBe(false); // too short
	});

	it('reports each requirement individually', () => {
		const c = checkPassword('abcDEF123!!!!!!!!');
		expect(c.minLength).toBe(true);
		expect(c.upper).toBe(true);
		expect(c.lower).toBe(true);
		expect(c.digit).toBe(true);
		expect(c.special).toBe(true);
	});

	it('strength grows with classes and length', () => {
		expect(passwordStrength('')).toBe(0);
		expect(passwordStrength('abc')).toBeLessThan(passwordStrength('Abc123!xxxxxxxxxxxxxxxxxx'));
	});
});

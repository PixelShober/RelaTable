// Password policy (DEC-032): >= 16 chars, upper + lower, >= 1 digit, >= 1 special.
// Pure + framework-free so it can be shared client/server and unit-tested.

export interface PasswordCheck {
	minLength: boolean;
	upper: boolean;
	lower: boolean;
	digit: boolean;
	special: boolean;
}

export const PASSWORD_MIN_LENGTH = 16;

export function checkPassword(pw: string): PasswordCheck {
	return {
		minLength: pw.length >= PASSWORD_MIN_LENGTH,
		upper: /[A-Z]/.test(pw),
		lower: /[a-z]/.test(pw),
		digit: /[0-9]/.test(pw),
		special: /[^A-Za-z0-9]/.test(pw)
	};
}

export function isPasswordValid(pw: string): boolean {
	const c = checkPassword(pw);
	return c.minLength && c.upper && c.lower && c.digit && c.special;
}

/** 0..4 strength buckets for the meter shown in SCR-001. */
export function passwordStrength(pw: string): number {
	if (!pw) return 0;
	const c = checkPassword(pw);
	let score = 0;
	if (c.upper) score++;
	if (c.lower) score++;
	if (c.digit) score++;
	if (c.special) score++;
	if (pw.length >= PASSWORD_MIN_LENGTH) score++;
	if (pw.length >= 24) score = Math.min(5, score + 1);
	return Math.min(5, score);
}

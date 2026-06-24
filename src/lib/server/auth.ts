import { hash, verify } from '@node-rs/argon2';
import { randomBytes } from 'node:crypto';
import type { Cookies } from '@sveltejs/kit';
import { db } from './db';

export interface SessionUser {
	id: number;
	displayName: string;
	themePreference: string;
}

const COOKIE = process.env.SESSION_COOKIE || 'relatable_session';
const TTL_REMEMBER_DAYS = Number(process.env.SESSION_TTL_DAYS_REMEMBER || 30);
const TTL_SHORT_HOURS = Number(process.env.SESSION_TTL_HOURS_SHORT || 12);

// Argon2id parameters (DEC-018). Defaults are interactive-safe.
const ARGON_OPTS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(pw: string): Promise<string> {
	return hash(pw, ARGON_OPTS);
}

export function verifyPassword(stored: string, pw: string): Promise<boolean> {
	return verify(stored, pw).catch(() => false);
}

/** Whether the single owner account has been created yet (first-run gate). */
export async function ownerExists(): Promise<boolean> {
	return (await db.appUser.count()) > 0;
}

export async function createSession(userId: number, remember: boolean): Promise<{ id: string; expiresAt: Date }> {
	const id = randomBytes(32).toString('hex');
	const ms = remember
		? TTL_REMEMBER_DAYS * 24 * 60 * 60 * 1000
		: TTL_SHORT_HOURS * 60 * 60 * 1000;
	const expiresAt = new Date(Date.now() + ms);
	await db.session.create({ data: { id, userId, expiresAt } });
	return { id, expiresAt };
}

export function setSessionCookie(cookies: Cookies, id: string, expiresAt: Date) {
	cookies.set(COOKIE, id, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: process.env.NODE_ENV === 'production',
		expires: expiresAt
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(COOKIE, { path: '/' });
}

export function sessionCookieName(): string {
	return COOKIE;
}

/** Resolve the current user from the session cookie, pruning expired sessions. */
export async function resolveSession(
	cookies: Cookies
): Promise<{ user: SessionUser | null; sessionId: string | null }> {
	const id = cookies.get(COOKIE);
	if (!id) return { user: null, sessionId: null };
	const session = await db.session.findUnique({ where: { id }, include: { user: true } });
	if (!session) return { user: null, sessionId: null };
	if (session.expiresAt.getTime() < Date.now()) {
		await db.session.delete({ where: { id } }).catch(() => {});
		clearSessionCookie(cookies);
		return { user: null, sessionId: null };
	}
	return {
		user: {
			id: session.user.id,
			displayName: session.user.displayName,
			themePreference: session.user.themePreference
		},
		sessionId: id
	};
}

export async function destroySession(id: string) {
	await db.session.delete({ where: { id } }).catch(() => {});
}

import { fail, redirect } from '@sveltejs/kit';
import { z } from 'zod';
import { db } from '$lib/server/db';
import {
	ownerExists,
	hashPassword,
	createSession,
	setSessionCookie
} from '$lib/server/auth';
import { isPasswordValid } from '$lib/domain/password';
import type { Actions } from './$types';

const schema = z
	.object({
		displayName: z.string().trim().min(1, 'Anzeigename erforderlich').max(120),
		password: z.string(),
		confirm: z.string()
	})
	.refine((d) => isPasswordValid(d.password), {
		message: 'Passwort erfüllt die Richtlinie nicht.',
		path: ['password']
	})
	.refine((d) => d.password === d.confirm, {
		message: 'Passwörter stimmen nicht überein.',
		path: ['confirm']
	});

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		if (await ownerExists()) throw redirect(303, '/login');

		const form = Object.fromEntries(await request.formData());
		const parsed = schema.safeParse(form);
		if (!parsed.success) {
			const errors = parsed.error.flatten().fieldErrors;
			return fail(400, { displayName: String(form.displayName ?? ''), errors });
		}

		const passwordHash = await hashPassword(parsed.data.password);
		const user = await db.appUser.create({
			data: { displayName: parsed.data.displayName, passwordHash, themePreference: 'System' }
		});
		const { id, expiresAt } = await createSession(user.id, true);
		setSessionCookie(cookies, id, expiresAt);
		throw redirect(303, '/graph');
	}
};

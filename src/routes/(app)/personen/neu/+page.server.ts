import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { processPersonForm } from '$lib/server/personForm';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const result = await processPersonForm(await request.formData());
		if (!result.ok) return fail(400, { errors: result.errors, values: result.values });

		const person = await db.person.create({
			data: { ownerId: locals.user!.id, ...result.data! }
		});
		throw redirect(303, `/personen/${person.id}`);
	}
};

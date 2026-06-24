import { redirect } from '@sveltejs/kit';
import { getBoolSetting, SETTING_KEYS } from '$lib/server/settings';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	const railPinned = await getBoolSetting(locals.user.id, SETTING_KEYS.railPinned, false);
	const hideSensitiveByDefault = await getBoolSetting(
		locals.user.id,
		SETTING_KEYS.hideSensitiveByDefault,
		true
	);
	return { user: locals.user, railPinned, hideSensitiveByDefault };
};

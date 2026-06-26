import { redirect } from '@sveltejs/kit';
import { getBoolSetting, SETTING_KEYS } from '$lib/server/settings';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) throw redirect(303, '/login');
	const [railPinned, hideSensitiveByDefault, narrateAutoApprove, narratePragmaticMode] =
		await Promise.all([
			getBoolSetting(locals.user.id, SETTING_KEYS.railPinned, false),
			getBoolSetting(locals.user.id, SETTING_KEYS.hideSensitiveByDefault, true),
			getBoolSetting(locals.user.id, SETTING_KEYS.narrateAutoApprove, false),
			getBoolSetting(locals.user.id, SETTING_KEYS.narratePragmaticMode, false)
		]);
	return { user: locals.user, railPinned, hideSensitiveByDefault, narrateAutoApprove, narratePragmaticMode };
};

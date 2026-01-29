import type { LayoutServerLoad } from './$types';
import type { UserProfile } from '$lib/types';
import { validateProfile } from '$lib/services/profiles';

export const load: LayoutServerLoad = async ({ locals }) => {
	const { session, supabase } = locals;
	let profile: UserProfile | null = null;

	if (session) {
		const { data } = await supabase
			.from('profiles')
			.select('id, display_name, role')
			.eq('id', session.user.id)
			.single();

		if (data) {
			profile = validateProfile(data);
		}
	}

	return { session, profile };
};

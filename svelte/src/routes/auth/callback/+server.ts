import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const supabase = createServerSupabaseClient(cookies);
		const { error } = await supabase.auth.exchangeCodeForSession(code);

		if (error) {
			redirect(303, '/auth/login?error=callback_failed');
		}
	}

	redirect(303, '/');
};

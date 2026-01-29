import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createServerSupabaseClient } from '$lib/supabase/server';

export const GET: RequestHandler = async ({ url, cookies }) => {
	const code = url.searchParams.get('code');

	if (code) {
		const supabase = createServerSupabaseClient(cookies);
		await supabase.auth.exchangeCodeForSession(code);
	}

	redirect(303, '/articles');
};

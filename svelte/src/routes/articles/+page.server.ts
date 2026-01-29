import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { fetchArticles } from '$lib/services/articles';

export const load: PageServerLoad = async ({ locals }) => {
	const { session, supabase } = locals;

	if (!session) {
		redirect(303, '/auth/login');
	}

	const { articles, count } = await fetchArticles(supabase, {
		page: 0
	});

	return { articles, totalCount: count };
};

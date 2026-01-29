import type { PageServerLoad } from './$types';
import { fetchArticles } from '$lib/services/articles';

export const load: PageServerLoad = async ({ locals }) => {
	const { supabase } = locals;

	const { articles, count } = await fetchArticles(supabase, {
		page: 0
	});

	return { articles, totalCount: count };
};

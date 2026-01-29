// TODO: Generate types from Supabase (`supabase gen types typescript`) to replace
// manual `as unknown as Article` casts with proper type-safe database types.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Article, ArticleCreate, ArticleUpdate, StatusFilter } from '$lib/types';
import { PAGE_SIZE } from '$lib/constants';

interface FetchArticlesParams {
	page: number;
	search?: string;
	status?: StatusFilter;
}

interface FetchArticlesResult {
	articles: Article[];
	count: number;
}

export async function fetchArticles(
	supabase: SupabaseClient,
	params: FetchArticlesParams
): Promise<FetchArticlesResult> {
	const { page, search, status } = params;
	const from = page * PAGE_SIZE;
	const to = from + PAGE_SIZE - 1;

	let query = supabase
		.from('articles')
		.select(
			'id, title, content, status, author_id, created_at, updated_at, published_at, profiles(display_name)',
			{ count: 'exact' }
		)
		.order('created_at', { ascending: false })
		.order('id', { ascending: false })
		.range(from, to);

	if (status && status !== 'all') {
		query = query.eq('status', status);
	}

	if (search) {
		const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_');
		query = query.ilike('title', `%${escaped}%`);
	}

	const { data, error, count } = await query;

	if (error) {
		throw new Error(error.message);
	}

	return {
		articles: (data ?? []) as unknown as Article[],
		count: count ?? 0
	};
}

export async function createArticle(
	supabase: SupabaseClient,
	userId: string,
	data: ArticleCreate
): Promise<Article> {
	const { data: article, error } = await supabase
		.from('articles')
		.insert({ ...data, author_id: userId })
		.select(
			'id, title, content, status, author_id, created_at, updated_at, published_at, profiles(display_name)'
		)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return article as unknown as Article;
}

export async function updateArticle(
	supabase: SupabaseClient,
	id: string,
	data: ArticleUpdate
): Promise<Article> {
	const { data: article, error } = await supabase
		.from('articles')
		.update(data)
		.eq('id', id)
		.select(
			'id, title, content, status, author_id, created_at, updated_at, published_at, profiles(display_name)'
		)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return article as unknown as Article;
}

export async function deleteArticle(supabase: SupabaseClient, id: string): Promise<void> {
	const { error } = await supabase.from('articles').delete().eq('id', id);

	if (error) {
		throw new Error(error.message);
	}
}

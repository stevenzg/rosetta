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

const ARTICLE_SELECT =
	'id, title, content, status, author_id, created_at, updated_at, published_at, profiles(display_name)';

/**
 * Validates that a raw database row conforms to the Article shape at runtime.
 * Provides a safety net when Supabase query results drift from the Article interface.
 */
function validateArticle(row: unknown): Article {
	if (typeof row !== 'object' || row === null) {
		throw new Error('Invalid article data: expected an object');
	}

	const r = row as Record<string, unknown>;

	if (typeof r.id !== 'string') throw new Error('Invalid article: missing or invalid id');
	if (typeof r.title !== 'string') throw new Error('Invalid article: missing or invalid title');
	if (r.content !== null && typeof r.content !== 'string')
		throw new Error('Invalid article: invalid content');
	if (r.status !== 'draft' && r.status !== 'published')
		throw new Error('Invalid article: invalid status');
	if (typeof r.author_id !== 'string')
		throw new Error('Invalid article: missing or invalid author_id');
	if (typeof r.created_at !== 'string')
		throw new Error('Invalid article: missing or invalid created_at');
	if (typeof r.updated_at !== 'string')
		throw new Error('Invalid article: missing or invalid updated_at');
	if (r.published_at !== null && typeof r.published_at !== 'string')
		throw new Error('Invalid article: invalid published_at');

	const profiles = r.profiles;
	let validatedProfiles: { display_name: string } | null = null;
	if (profiles !== null && profiles !== undefined) {
		if (typeof profiles !== 'object') throw new Error('Invalid article: invalid profiles');
		const p = profiles as Record<string, unknown>;
		if (typeof p.display_name !== 'string')
			throw new Error('Invalid article: invalid profiles.display_name');
		validatedProfiles = { display_name: p.display_name };
	}

	return {
		id: r.id as string,
		title: r.title as string,
		content: (r.content as string | null) ?? null,
		status: r.status as Article['status'],
		author_id: r.author_id as string,
		created_at: r.created_at as string,
		updated_at: r.updated_at as string,
		published_at: (r.published_at as string | null) ?? null,
		profiles: validatedProfiles
	};
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
		.select(ARTICLE_SELECT, { count: 'exact' })
		.order('created_at', { ascending: false })
		.order('id', { ascending: false })
		.range(from, to);

	if (status && status !== 'all') {
		query = query.eq('status', status);
	}

	if (search) {
		// Use full-text search to leverage the GIN index (idx_articles_title_search)
		// on to_tsvector('english', title). ilike would cause a sequential scan.
		query = query.textSearch('title', search, { type: 'websearch' });
	}

	const { data, error, count } = await query;

	if (error) {
		throw new Error(error.message);
	}

	return {
		articles: (data ?? []).map(validateArticle),
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
		.select(ARTICLE_SELECT)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return validateArticle(article);
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
		.select(ARTICLE_SELECT)
		.single();

	if (error) {
		throw new Error(error.message);
	}

	return validateArticle(article);
}

export async function deleteArticle(supabase: SupabaseClient, id: string): Promise<void> {
	const { error } = await supabase.from('articles').delete().eq('id', id);

	if (error) {
		throw new Error(error.message);
	}
}

export type ArticleStatus = 'draft' | 'published';

export interface Article {
	id: string;
	title: string;
	content: string | null;
	status: ArticleStatus;
	author_id: string;
	created_at: string;
	updated_at: string;
	published_at: string | null;
	profiles: { display_name: string } | null;
}

export interface ArticleCreate {
	title: string;
	content?: string;
	status: ArticleStatus;
}

export interface ArticleUpdate {
	title?: string;
	content?: string;
	status?: ArticleStatus;
}

export type StatusFilter = ArticleStatus | 'all';

import { describe, it, expect, vi } from 'vitest';
import { fetchArticles, createArticle, updateArticle, deleteArticle } from './articles';

function makeMockArticle(overrides: Record<string, unknown> = {}) {
	return {
		id: 'abc-123',
		title: 'Test Article',
		content: 'Some content',
		status: 'draft',
		author_id: 'user-1',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
		published_at: null,
		profiles: { display_name: 'Test User' },
		...overrides
	};
}

function makeMockSupabase(data: unknown, error: unknown = null, count: number | null = null) {
	const chain = {
		select: vi.fn().mockReturnThis(),
		insert: vi.fn().mockReturnThis(),
		update: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		eq: vi.fn().mockReturnThis(),
		order: vi.fn().mockReturnThis(),
		range: vi.fn().mockReturnThis(),
		textSearch: vi.fn().mockReturnThis(),
		single: vi.fn().mockResolvedValue({ data, error }),
		from: vi.fn().mockReturnThis(),
		then: undefined as unknown
	};

	// Make the chain itself thenable so `await query` works for fetchArticles
	const thenableChain = {
		...chain,
		from: vi.fn(() => {
			const queryChain = { ...chain };
			// Override range to resolve with list data
			queryChain.range = vi
				.fn()
				.mockResolvedValue({ data: Array.isArray(data) ? data : [data], error, count });
			// Override textSearch to return queryChain
			queryChain.textSearch = vi.fn().mockReturnValue(queryChain);
			return queryChain;
		})
	};

	return thenableChain as unknown as import('@supabase/supabase-js').SupabaseClient;
}

describe('fetchArticles', () => {
	it('should return validated articles and count', async () => {
		expect.assertions(3);
		const article = makeMockArticle();
		const supabase = makeMockSupabase(article, null, 1);

		const result = await fetchArticles(supabase, { page: 0 });

		expect(result.articles).toHaveLength(1);
		expect(result.articles[0].title).toBe('Test Article');
		expect(result.count).toBe(1);
	});

	it('should throw on supabase error', async () => {
		expect.assertions(1);
		const supabase = makeMockSupabase(null, { message: 'DB error' }, null);

		await expect(fetchArticles(supabase, { page: 0 })).rejects.toThrow('DB error');
	});
});

describe('createArticle', () => {
	it('should return a validated article on success', async () => {
		expect.assertions(1);
		const article = makeMockArticle();
		const supabase = makeMockSupabase(article);

		const result = await createArticle(supabase, 'user-1', {
			title: 'Test Article',
			status: 'draft'
		});

		expect(result.id).toBe('abc-123');
	});

	it('should throw on supabase error', async () => {
		expect.assertions(1);
		const supabase = makeMockSupabase(null, { message: 'Insert failed' });

		await expect(
			createArticle(supabase, 'user-1', { title: 'Test', status: 'draft' })
		).rejects.toThrow('Insert failed');
	});
});

describe('updateArticle', () => {
	it('should return a validated updated article', async () => {
		expect.assertions(1);
		const article = makeMockArticle({ title: 'Updated Title' });
		const supabase = makeMockSupabase(article);

		const result = await updateArticle(supabase, 'abc-123', { title: 'Updated Title' });

		expect(result.title).toBe('Updated Title');
	});
});

describe('deleteArticle', () => {
	it('should not throw on success', async () => {
		expect.assertions(1);
		const chain = {
			from: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			eq: vi.fn().mockResolvedValue({ error: null })
		};
		const supabase = chain as unknown as import('@supabase/supabase-js').SupabaseClient;

		await expect(deleteArticle(supabase, 'abc-123')).resolves.toBeUndefined();
	});

	it('should throw on supabase error', async () => {
		expect.assertions(1);
		const chain = {
			from: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			eq: vi.fn().mockResolvedValue({ error: { message: 'Delete failed' } })
		};
		const supabase = chain as unknown as import('@supabase/supabase-js').SupabaseClient;

		await expect(deleteArticle(supabase, 'abc-123')).rejects.toThrow('Delete failed');
	});
});

describe('validateArticle (via fetchArticles)', () => {
	it('should reject articles with missing required fields', async () => {
		expect.assertions(1);
		const invalidArticle = { id: 123 }; // id should be string
		const supabase = makeMockSupabase(invalidArticle, null, 1);

		await expect(fetchArticles(supabase, { page: 0 })).rejects.toThrow('Invalid article');
	});

	it('should reject articles with invalid status', async () => {
		expect.assertions(1);
		const invalidArticle = makeMockArticle({ status: 'archived' });
		const supabase = makeMockSupabase(invalidArticle, null, 1);

		await expect(fetchArticles(supabase, { page: 0 })).rejects.toThrow(
			'Invalid article: invalid status'
		);
	});
});

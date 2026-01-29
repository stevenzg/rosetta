import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ArticleCard from './ArticleCard.svelte';
import type { Article } from '$lib/types';

function makeMockArticle(overrides: Partial<Article> = {}): Article {
	return {
		id: 'abcdef12-3456-7890-abcd-ef1234567890',
		title: 'Test Article Title',
		content: 'Some content',
		status: 'draft',
		author_id: 'user-1',
		created_at: '2025-06-15T12:00:00Z',
		updated_at: '2025-06-15T12:00:00Z',
		published_at: null,
		profiles: { display_name: 'Jane Doe' },
		...overrides
	};
}

describe('ArticleCard', () => {
	it('renders article data', async () => {
		expect.assertions(4);
		const article = makeMockArticle();
		render(ArticleCard, {
			props: {
				article,
				userRole: 'viewer',
				onEdit: vi.fn(),
				onDelete: vi.fn()
			}
		});

		// Title
		await expect.element(page.getByText('Test Article Title')).toBeInTheDocument();
		// Draft badge
		await expect.element(page.getByText('draft')).toBeInTheDocument();
		// Author display name
		await expect.element(page.getByText('By Jane Doe')).toBeInTheDocument();
		// Date should contain year
		await expect.element(page.getByText(/2025/)).toBeInTheDocument();
	});

	it('shows "Unknown" when profiles is null', async () => {
		expect.assertions(1);
		const article = makeMockArticle({ profiles: null });
		render(ArticleCard, {
			props: {
				article,
				userRole: 'viewer',
				onEdit: vi.fn(),
				onDelete: vi.fn()
			}
		});

		await expect.element(page.getByText('By Unknown')).toBeInTheDocument();
	});

	it('does not show draft badge for published articles', async () => {
		expect.assertions(1);
		const article = makeMockArticle({ status: 'published' });
		render(ArticleCard, {
			props: {
				article,
				userRole: 'viewer',
				onEdit: vi.fn(),
				onDelete: vi.fn()
			}
		});

		await expect.element(page.getByText('draft')).not.toBeInTheDocument();
	});

	it('shows edit and delete buttons for editors', async () => {
		expect.assertions(2);
		const article = makeMockArticle();
		render(ArticleCard, {
			props: {
				article,
				userRole: 'editor',
				onEdit: vi.fn(),
				onDelete: vi.fn()
			}
		});

		await expect
			.element(page.getByRole('button', { name: 'Edit article: Test Article Title' }))
			.toBeInTheDocument();
		await expect
			.element(page.getByRole('button', { name: 'Delete article: Test Article Title' }))
			.toBeInTheDocument();
	});

	it('hides edit and delete buttons for viewers (invisible)', async () => {
		expect.assertions(1);
		const article = makeMockArticle();
		const screen = render(ArticleCard, {
			props: {
				article,
				userRole: 'viewer',
				onEdit: vi.fn(),
				onDelete: vi.fn()
			}
		});

		// Buttons should exist but be invisible (tabindex=-1)
		const editBtn = screen.container.querySelector(
			'[aria-label="Edit article: Test Article Title"]'
		) as HTMLElement;
		expect(editBtn?.tabIndex).toBe(-1);
	});

	it('calls onEdit when edit button is clicked', async () => {
		expect.assertions(1);
		const article = makeMockArticle();
		const onEdit = vi.fn();
		render(ArticleCard, {
			props: {
				article,
				userRole: 'editor',
				onEdit,
				onDelete: vi.fn()
			}
		});

		await page.getByRole('button', { name: 'Edit article: Test Article Title' }).click();
		expect(onEdit).toHaveBeenCalledWith(article);
	});

	it('calls onDelete when delete button is clicked', async () => {
		expect.assertions(1);
		const article = makeMockArticle();
		const onDelete = vi.fn();
		render(ArticleCard, {
			props: {
				article,
				userRole: 'editor',
				onEdit: vi.fn(),
				onDelete
			}
		});

		await page.getByRole('button', { name: 'Delete article: Test Article Title' }).click();
		expect(onDelete).toHaveBeenCalledWith(article);
	});

	it('has aria-label on status badge', async () => {
		expect.assertions(1);
		const article = makeMockArticle({ status: 'draft' });
		const screen = render(ArticleCard, {
			props: {
				article,
				userRole: 'viewer',
				onEdit: vi.fn(),
				onDelete: vi.fn()
			}
		});

		const badge = screen.container.querySelector('[aria-label="Status: draft"]');
		expect(badge).not.toBeNull();
	});
});

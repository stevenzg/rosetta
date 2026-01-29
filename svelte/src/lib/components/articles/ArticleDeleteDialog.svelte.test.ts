import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ArticleDeleteDialog from './ArticleDeleteDialog.svelte';
import type { Article } from '$lib/types';

function makeMockArticle(): Article {
	return {
		id: 'abc-123',
		title: 'Article to Delete',
		content: 'Content',
		status: 'draft',
		author_id: 'user-1',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
		published_at: null,
		profiles: { display_name: 'Test User' }
	};
}

describe('ArticleDeleteDialog', () => {
	it('does not render when closed', async () => {
		expect.assertions(1);
		render(ArticleDeleteDialog, {
			props: {
				open: false,
				article: makeMockArticle(),
				onClose: vi.fn(),
				onConfirm: vi.fn()
			}
		});

		await expect.element(page.getByRole('alertdialog')).not.toBeInTheDocument();
	});

	it('renders delete confirmation when open', async () => {
		expect.assertions(3);
		const article = makeMockArticle();
		render(ArticleDeleteDialog, {
			props: {
				open: true,
				article,
				onClose: vi.fn(),
				onConfirm: vi.fn()
			}
		});

		await expect.element(page.getByRole('alertdialog')).toBeInTheDocument();
		await expect.element(page.getByText('Delete Article')).toBeInTheDocument();
		await expect.element(page.getByText('Article to Delete')).toBeInTheDocument();
	});

	it('calls onClose when Cancel is clicked', async () => {
		expect.assertions(1);
		const onClose = vi.fn();
		render(ArticleDeleteDialog, {
			props: {
				open: true,
				article: makeMockArticle(),
				onClose,
				onConfirm: vi.fn()
			}
		});

		await page.getByRole('button', { name: 'Cancel' }).click();
		expect(onClose).toHaveBeenCalled();
	});

	it('calls onConfirm when Delete is clicked', async () => {
		expect.assertions(1);
		const onConfirm = vi.fn().mockResolvedValue(undefined);
		render(ArticleDeleteDialog, {
			props: {
				open: true,
				article: makeMockArticle(),
				onClose: vi.fn(),
				onConfirm
			}
		});

		await page.getByRole('button', { name: 'Delete' }).click();
		expect(onConfirm).toHaveBeenCalledOnce();
	});

	it('shows error message when provided', async () => {
		expect.assertions(1);
		render(ArticleDeleteDialog, {
			props: {
				open: true,
				article: makeMockArticle(),
				error: 'Failed to delete',
				onClose: vi.fn(),
				onConfirm: vi.fn()
			}
		});

		await expect.element(page.getByText('Failed to delete')).toBeInTheDocument();
	});

	it('has proper ARIA attributes for alertdialog', async () => {
		expect.assertions(2);
		const screen = render(ArticleDeleteDialog, {
			props: {
				open: true,
				article: makeMockArticle(),
				onClose: vi.fn(),
				onConfirm: vi.fn()
			}
		});

		const modalEl = screen.container.querySelector('[aria-modal="true"]');
		expect(modalEl).not.toBeNull();

		const describedEl = screen.container.querySelector('[aria-describedby="delete-dialog-desc"]');
		expect(describedEl).not.toBeNull();
	});
});

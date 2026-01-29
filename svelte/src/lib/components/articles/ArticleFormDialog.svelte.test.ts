import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ArticleFormDialog from './ArticleFormDialog.svelte';
import type { Article } from '$lib/types';

function makeMockArticle(): Article {
	return {
		id: 'abc-123',
		title: 'Existing Article',
		content: 'Existing content',
		status: 'published',
		author_id: 'user-1',
		created_at: '2025-01-01T00:00:00Z',
		updated_at: '2025-01-01T00:00:00Z',
		published_at: '2025-01-01T00:00:00Z',
		profiles: { display_name: 'Test User' }
	};
}

describe('ArticleFormDialog', () => {
	it('does not render when closed', async () => {
		expect.assertions(1);
		render(ArticleFormDialog, {
			props: {
				open: false,
				onClose: vi.fn(),
				onSubmit: vi.fn()
			}
		});

		await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
	});

	it('renders create form when open with no article', async () => {
		expect.assertions(3);
		render(ArticleFormDialog, {
			props: {
				open: true,
				article: null,
				onClose: vi.fn(),
				onSubmit: vi.fn()
			}
		});

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();
		await expect.element(page.getByRole('heading', { name: 'Create Article' })).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Create article' })).toBeInTheDocument();
	});

	it('renders edit form when article is provided', async () => {
		expect.assertions(2);
		const article = makeMockArticle();
		render(ArticleFormDialog, {
			props: {
				open: true,
				article,
				onClose: vi.fn(),
				onSubmit: vi.fn()
			}
		});

		await expect.element(page.getByText('Edit Article')).toBeInTheDocument();
		await expect.element(page.getByRole('button', { name: 'Save changes' })).toBeInTheDocument();
	});

	it('disables submit button when title is empty', async () => {
		expect.assertions(1);
		render(ArticleFormDialog, {
			props: {
				open: true,
				article: null,
				onClose: vi.fn(),
				onSubmit: vi.fn()
			}
		});

		await expect.element(page.getByRole('button', { name: 'Create article' })).toBeDisabled();
	});

	it('shows server error when provided', async () => {
		expect.assertions(1);
		render(ArticleFormDialog, {
			props: {
				open: true,
				error: 'Server error occurred',
				onClose: vi.fn(),
				onSubmit: vi.fn()
			}
		});

		await expect.element(page.getByText('Server error occurred')).toBeInTheDocument();
	});

	it('calls onClose when close button is clicked', async () => {
		expect.assertions(1);
		const onClose = vi.fn();
		render(ArticleFormDialog, {
			props: {
				open: true,
				onClose,
				onSubmit: vi.fn()
			}
		});

		await page.getByRole('button', { name: 'Close dialog' }).click();
		expect(onClose).toHaveBeenCalled();
	});

	it('calls onClose when Cancel button is clicked', async () => {
		expect.assertions(1);
		const onClose = vi.fn();
		render(ArticleFormDialog, {
			props: {
				open: true,
				onClose,
				onSubmit: vi.fn()
			}
		});

		await page.getByRole('button', { name: 'Cancel' }).click();
		expect(onClose).toHaveBeenCalled();
	});

	it('calls onSubmit with form data on valid submission', async () => {
		expect.assertions(2);
		const onSubmit = vi.fn().mockResolvedValue(undefined);
		render(ArticleFormDialog, {
			props: {
				open: true,
				article: null,
				onClose: vi.fn(),
				onSubmit
			}
		});

		await page.getByLabelText('Title').fill('New Test Article');
		await page.getByLabelText('Content').fill('Some test content');
		await page.getByRole('button', { name: 'Create article' }).click();

		expect(onSubmit).toHaveBeenCalledOnce();
		const callArgs = onSubmit.mock.calls[0][0];
		expect(callArgs.title).toBe('New Test Article');
	});

	it('has proper ARIA attributes', async () => {
		expect.assertions(3);
		const screen = render(ArticleFormDialog, {
			props: {
				open: true,
				onClose: vi.fn(),
				onSubmit: vi.fn()
			}
		});

		await expect.element(page.getByRole('dialog')).toBeInTheDocument();

		// aria-modal and aria-labelledby
		const modalEl = screen.container.querySelector('[aria-modal="true"]');
		expect(modalEl).not.toBeNull();

		const labelledEl = screen.container.querySelector('[aria-labelledby="dialog-title"]');
		expect(labelledEl).not.toBeNull();
	});
});

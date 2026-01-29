import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ArticleListSkeleton from './ArticleListSkeleton.svelte';

describe('ArticleListSkeleton', () => {
	it('renders with aria-busy and aria-label attributes', async () => {
		expect.assertions(1);
		const screen = render(ArticleListSkeleton);

		// The container div has aria-busy="true" and aria-label="Loading articles"
		const el = screen.container.querySelector('[aria-busy="true"][aria-label="Loading articles"]');
		expect(el).not.toBeNull();
	});

	it('renders default 5 skeleton rows', async () => {
		expect.assertions(1);
		const screen = render(ArticleListSkeleton);

		const rows = screen.container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(5);
	});

	it('renders custom number of skeleton rows', async () => {
		expect.assertions(1);
		const screen = render(ArticleListSkeleton, { props: { rows: 3 } });

		const rows = screen.container.querySelectorAll('tbody tr');
		expect(rows.length).toBe(3);
	});

	it('renders table headers', async () => {
		expect.assertions(5);
		render(ArticleListSkeleton);

		await expect.element(page.getByRole('columnheader', { name: 'ID' })).toBeInTheDocument();
		await expect.element(page.getByRole('columnheader', { name: 'Title' })).toBeInTheDocument();
		await expect.element(page.getByRole('columnheader', { name: 'Status' })).toBeInTheDocument();
		await expect.element(page.getByRole('columnheader', { name: 'Author' })).toBeInTheDocument();
		await expect.element(page.getByRole('columnheader', { name: 'Created' })).toBeInTheDocument();
	});
});

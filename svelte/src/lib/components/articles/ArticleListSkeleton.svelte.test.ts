import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ArticleListSkeleton from './ArticleListSkeleton.svelte';

describe('ArticleListSkeleton', () => {
	it('renders with role="status" and aria-label attributes', async () => {
		expect.assertions(1);
		const screen = render(ArticleListSkeleton);

		const el = screen.container.querySelector('[role="status"][aria-label="Loading articles"]');
		expect(el).not.toBeNull();
	});

	it('renders default 5 skeleton cards', async () => {
		expect.assertions(1);
		const screen = render(ArticleListSkeleton);

		const cards = screen.container.querySelectorAll('.rounded-lg.border');
		expect(cards.length).toBe(5);
	});

	it('renders custom number of skeleton cards', async () => {
		expect.assertions(1);
		const screen = render(ArticleListSkeleton, { props: { count: 3 } });

		const cards = screen.container.querySelectorAll('.rounded-lg.border');
		expect(cards.length).toBe(3);
	});

	it('renders sr-only loading text', async () => {
		expect.assertions(1);
		render(ArticleListSkeleton);

		await expect.element(page.getByText('Loading articles, please wait...')).toBeInTheDocument();
	});
});

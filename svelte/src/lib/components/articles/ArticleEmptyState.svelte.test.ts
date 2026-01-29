import { describe, it, expect } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ArticleEmptyState from './ArticleEmptyState.svelte';

describe('ArticleEmptyState', () => {
	it('renders default "No articles found" message', async () => {
		expect.assertions(1);
		render(ArticleEmptyState);

		await expect.element(page.getByText('No articles found')).toBeInTheDocument();
	});

	it('renders a custom message', async () => {
		expect.assertions(1);
		render(ArticleEmptyState, { props: { message: 'Nothing here' } });

		await expect.element(page.getByText('Nothing here')).toBeInTheDocument();
	});

	it('has role="status"', async () => {
		expect.assertions(1);
		render(ArticleEmptyState);

		await expect.element(page.getByRole('status')).toBeInTheDocument();
	});
});

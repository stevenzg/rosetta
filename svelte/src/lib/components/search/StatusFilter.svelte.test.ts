import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import StatusFilter from './StatusFilter.svelte';

describe('StatusFilter', () => {
	it('renders as a radiogroup with all status options', async () => {
		expect.assertions(4);
		render(StatusFilter, {
			props: { value: 'all', onChange: vi.fn() }
		});

		await expect
			.element(page.getByRole('radiogroup', { name: 'Filter articles by status' }))
			.toBeInTheDocument();
		await expect.element(page.getByRole('radio', { name: 'All' })).toBeInTheDocument();
		await expect.element(page.getByRole('radio', { name: 'Published' })).toBeInTheDocument();
		await expect.element(page.getByRole('radio', { name: 'Draft' })).toBeInTheDocument();
	});

	it('marks the active filter as checked', async () => {
		expect.assertions(2);
		render(StatusFilter, {
			props: { value: 'published', onChange: vi.fn() }
		});

		const publishedRadio = page.getByRole('radio', { name: 'Published' });
		await expect.element(publishedRadio).toHaveAttribute('aria-checked', 'true');

		const allRadio = page.getByRole('radio', { name: 'All' });
		await expect.element(allRadio).toHaveAttribute('aria-checked', 'false');
	});

	it('calls onChange when a filter option is clicked', async () => {
		expect.assertions(1);
		const onChange = vi.fn();
		render(StatusFilter, {
			props: { value: 'all', onChange }
		});

		await page.getByRole('radio', { name: 'Published' }).click();
		expect(onChange).toHaveBeenCalledWith('published');
	});
});

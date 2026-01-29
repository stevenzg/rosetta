import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import SearchInput from './SearchInput.svelte';

describe('SearchInput', () => {
	it('renders with search role and aria-label', async () => {
		expect.assertions(2);
		render(SearchInput, {
			props: { value: '', onSearch: vi.fn() }
		});

		await expect.element(page.getByRole('search')).toBeInTheDocument();
		await expect.element(page.getByLabelText('Search articles by title')).toBeInTheDocument();
	});

	it('renders the initial value', async () => {
		expect.assertions(1);
		render(SearchInput, {
			props: { value: 'hello', onSearch: vi.fn() }
		});

		const input = page.getByLabelText('Search articles by title');
		await expect.element(input).toHaveValue('hello');
	});

	it('shows clear button when input has value', async () => {
		expect.assertions(1);
		render(SearchInput, {
			props: { value: 'something', onSearch: vi.fn() }
		});

		await expect.element(page.getByRole('button', { name: 'Clear search' })).toBeInTheDocument();
	});

	it('does not show clear button when input is empty', async () => {
		expect.assertions(1);
		render(SearchInput, {
			props: { value: '', onSearch: vi.fn() }
		});

		await expect
			.element(page.getByRole('button', { name: 'Clear search' }))
			.not.toBeInTheDocument();
	});

	it('calls onSearch with empty string when clear is clicked', async () => {
		expect.assertions(1);
		const onSearch = vi.fn();
		render(SearchInput, {
			props: { value: 'test', onSearch }
		});

		await page.getByRole('button', { name: 'Clear search' }).click();
		expect(onSearch).toHaveBeenCalledWith('');
	});
});

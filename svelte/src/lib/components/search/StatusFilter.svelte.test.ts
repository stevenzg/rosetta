import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import StatusFilter from './StatusFilter.svelte';

describe('StatusFilter', () => {
	it('renders with a label and select element', async () => {
		expect.assertions(2);
		render(StatusFilter, {
			props: { value: 'all', onChange: vi.fn() }
		});

		await expect.element(page.getByText('Status:')).toBeInTheDocument();
		await expect.element(page.getByRole('combobox')).toBeInTheDocument();
	});

	it('renders all status options', async () => {
		expect.assertions(3);
		render(StatusFilter, {
			props: { value: 'all', onChange: vi.fn() }
		});

		await expect.element(page.getByRole('option', { name: 'All' })).toBeInTheDocument();
		await expect.element(page.getByRole('option', { name: 'Published' })).toBeInTheDocument();
		await expect.element(page.getByRole('option', { name: 'Draft' })).toBeInTheDocument();
	});

	it('calls onChange when selection changes', async () => {
		expect.assertions(1);
		const onChange = vi.fn();
		render(StatusFilter, {
			props: { value: 'all', onChange }
		});

		await page.getByRole('combobox').selectOptions('published');
		expect(onChange).toHaveBeenCalledWith('published');
	});
});

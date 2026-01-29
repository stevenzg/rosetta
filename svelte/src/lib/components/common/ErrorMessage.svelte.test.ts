import { describe, it, expect, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { page } from '@vitest/browser/context';
import ErrorMessage from './ErrorMessage.svelte';

describe('ErrorMessage', () => {
	it('renders error message with alert role', async () => {
		expect.assertions(2);
		render(ErrorMessage, {
			props: { message: 'Something went wrong' }
		});

		await expect.element(page.getByRole('alert')).toBeInTheDocument();
		await expect.element(page.getByText('Something went wrong')).toBeInTheDocument();
	});

	it('renders retry button when onRetry is provided', async () => {
		expect.assertions(1);
		render(ErrorMessage, {
			props: { message: 'Network error', onRetry: vi.fn() }
		});

		await expect.element(page.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
	});

	it('does not render retry button when onRetry is omitted', async () => {
		expect.assertions(1);
		render(ErrorMessage, {
			props: { message: 'Fatal error' }
		});

		await expect.element(page.getByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
	});

	it('calls onRetry when retry button is clicked', async () => {
		expect.assertions(1);
		const onRetry = vi.fn();
		render(ErrorMessage, {
			props: { message: 'Failed to load', onRetry }
		});

		await page.getByRole('button', { name: 'Try again' }).click();
		expect(onRetry).toHaveBeenCalledOnce();
	});
});

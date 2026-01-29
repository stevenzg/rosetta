import { describe, it, expect, vi } from 'vitest';
import { debounce } from './debounce';

describe('debounce', () => {
	it('should delay function execution', () => {
		expect.assertions(2);
		vi.useFakeTimers();

		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced();
		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(300);
		expect(fn).toHaveBeenCalledOnce();

		vi.useRealTimers();
	});

	it('should reset the timer on subsequent calls', () => {
		expect.assertions(2);
		vi.useFakeTimers();

		const fn = vi.fn();
		const debounced = debounce(fn, 300);

		debounced();
		vi.advanceTimersByTime(200);
		debounced();
		vi.advanceTimersByTime(200);

		expect(fn).not.toHaveBeenCalled();

		vi.advanceTimersByTime(100);
		expect(fn).toHaveBeenCalledOnce();

		vi.useRealTimers();
	});

	it('should pass arguments to the debounced function', () => {
		expect.assertions(1);
		vi.useFakeTimers();

		const fn = vi.fn();
		const debounced = debounce(fn, 100);

		debounced('hello', 'world');
		vi.advanceTimersByTime(100);

		expect(fn).toHaveBeenCalledWith('hello', 'world');

		vi.useRealTimers();
	});
});

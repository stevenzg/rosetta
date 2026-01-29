import { describe, it, expect } from 'vitest';
import { formatDate } from './date';

describe('formatDate', () => {
	it('should format an ISO date string', () => {
		expect.assertions(1);
		const result = formatDate('2025-06-15T10:30:00Z');
		// en-US short month format
		expect(result).toContain('2025');
	});

	it('should handle different date strings consistently', () => {
		expect.assertions(2);
		// Use midday timestamps to avoid timezone boundary issues
		const result1 = formatDate('2024-06-15T12:00:00Z');
		const result2 = formatDate('2024-07-20T12:00:00Z');
		expect(result1).toContain('2024');
		expect(result2).toContain('2024');
	});

	it('should return a string in en-US locale format', () => {
		expect.assertions(1);
		const result = formatDate('2025-03-15T00:00:00Z');
		// Should contain month abbreviation
		expect(result).toMatch(/\w{3}\s+\d{1,2},\s+\d{4}/);
	});
});

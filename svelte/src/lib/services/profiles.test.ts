import { describe, it, expect } from 'vitest';
import { validateProfile } from './profiles';

describe('validateProfile', () => {
	it('should return a valid UserProfile for correct data', () => {
		expect.assertions(3);
		const profile = validateProfile({
			id: 'user-1',
			display_name: 'Alice',
			role: 'editor'
		});

		expect(profile.id).toBe('user-1');
		expect(profile.display_name).toBe('Alice');
		expect(profile.role).toBe('editor');
	});

	it('should accept viewer role', () => {
		expect.assertions(1);
		const profile = validateProfile({
			id: 'user-2',
			display_name: 'Bob',
			role: 'viewer'
		});

		expect(profile.role).toBe('viewer');
	});

	it('should throw for non-object input', () => {
		expect.assertions(1);
		expect(() => validateProfile(null)).toThrow('Invalid profile data');
	});

	it('should throw for missing id', () => {
		expect.assertions(1);
		expect(() => validateProfile({ display_name: 'Alice', role: 'viewer' })).toThrow(
			'missing or invalid id'
		);
	});

	it('should throw for missing display_name', () => {
		expect.assertions(1);
		expect(() => validateProfile({ id: 'user-1', role: 'viewer' })).toThrow(
			'missing or invalid display_name'
		);
	});

	it('should throw for invalid role', () => {
		expect.assertions(1);
		expect(() => validateProfile({ id: 'user-1', display_name: 'Alice', role: 'admin' })).toThrow(
			'invalid role'
		);
	});

	it('should throw for numeric id', () => {
		expect.assertions(1);
		expect(() => validateProfile({ id: 123, display_name: 'Alice', role: 'viewer' })).toThrow(
			'missing or invalid id'
		);
	});
});

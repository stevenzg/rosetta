import type { UserProfile, UserRole } from '$lib/types';

/**
 * Validates that a raw database row conforms to the UserProfile shape at runtime.
 * Mirrors the runtime validation pattern used in the articles service.
 */
export function validateProfile(row: unknown): UserProfile {
	if (typeof row !== 'object' || row === null) {
		throw new Error('Invalid profile data: expected an object');
	}

	const r = row as Record<string, unknown>;

	if (typeof r.id !== 'string') throw new Error('Invalid profile: missing or invalid id');
	if (typeof r.display_name !== 'string')
		throw new Error('Invalid profile: missing or invalid display_name');
	if (r.role !== 'viewer' && r.role !== 'editor') throw new Error('Invalid profile: invalid role');

	return {
		id: r.id,
		display_name: r.display_name,
		role: r.role as UserRole
	};
}

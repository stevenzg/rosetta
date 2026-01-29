export type UserRole = 'viewer' | 'editor';

export interface UserProfile {
	id: string;
	display_name: string;
	role: UserRole;
}

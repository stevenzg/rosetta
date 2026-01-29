import type { SupabaseClient, Session } from '@supabase/supabase-js';
import type { UserProfile } from '$lib/types';

declare global {
	namespace App {
		interface Locals {
			supabase: SupabaseClient;
			session: Session | null;
		}
		interface PageData {
			session: Session | null;
			profile: UserProfile | null;
		}
	}
}

export {};

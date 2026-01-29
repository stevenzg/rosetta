import { createBrowserClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLIC_KEY } from '$env/static/public';

let client: ReturnType<typeof createBrowserClient> | undefined;

/**
 * Returns a singleton browser Supabase client.
 * The client is created once and reused across all components.
 */
export function getClient() {
	if (!client) {
		client = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLIC_KEY);
	}
	return client;
}

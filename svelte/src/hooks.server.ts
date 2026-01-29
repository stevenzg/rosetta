import { createServerSupabaseClient } from '$lib/supabase/server';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createServerSupabaseClient(event.cookies);
	event.locals.supabase = supabase;

	// Use getUser() instead of getSession() to validate the JWT server-side.
	// getSession() only reads cookies without validation, which could allow
	// a tampered cookie to bypass auth.
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (user) {
		const {
			data: { session }
		} = await supabase.auth.getSession();
		event.locals.session = session;
	} else {
		event.locals.session = null;
	}

	if (event.url.pathname.startsWith('/articles') && !user) {
		redirect(303, '/auth/login');
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

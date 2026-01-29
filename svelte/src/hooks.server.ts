import { createServerSupabaseClient } from '$lib/supabase/server';
import { redirect, type Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const supabase = createServerSupabaseClient(event.cookies);
	event.locals.supabase = supabase;

	const {
		data: { session }
	} = await supabase.auth.getSession();
	event.locals.session = session;

	if (event.url.pathname.startsWith('/articles') && !session) {
		redirect(303, '/auth/login');
	}

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};

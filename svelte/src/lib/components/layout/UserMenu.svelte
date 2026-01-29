<script lang="ts">
	import { LogIn, LogOut, User, UserPlus } from 'lucide-svelte'
	import { getClient } from '$lib/supabase/client'
	import { goto, invalidateAll } from '$app/navigation'
	import type { UserProfile } from '$lib/types'
	import type { Session } from '@supabase/supabase-js'

	interface Props {
		session: Session | null
		profile: UserProfile | null
	}

	let { session, profile }: Props = $props()

	async function handleSignOut() {
		const supabase = getClient()
		await supabase.auth.signOut()
		await invalidateAll()
		await goto('/auth/login')
	}
</script>

{#if session && profile}
	<div class="flex items-center gap-2">
		<span class="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
			<User class="h-4 w-4" aria-hidden="true" />
			{profile.display_name || session.user.email}
		</span>
		<button
			type="button"
			onclick={handleSignOut}
			class="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			aria-label="Sign out"
		>
			<LogOut class="h-5 w-5" />
		</button>
	</div>
{:else}
	<a
		href="/auth/register"
		class="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		aria-label="Sign up"
	>
		<UserPlus class="h-5 w-5" />
	</a>
	<a
		href="/auth/login"
		class="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
		aria-label="Sign in"
	>
		<LogIn class="h-5 w-5" />
	</a>
{/if}

<script lang="ts">
	import { LogOut, User } from 'lucide-svelte'
	import { createClient } from '$lib/supabase/client'
	import { goto, invalidateAll } from '$app/navigation'
	import type { UserProfile } from '$lib/types'
	import type { Session } from '@supabase/supabase-js'

	interface Props {
		session: Session | null
		profile: UserProfile | null
	}

	let { session, profile }: Props = $props()
	let menuOpen = $state(false)

	async function handleSignOut() {
		const supabase = createClient()
		await supabase.auth.signOut()
		menuOpen = false
		await invalidateAll()
		await goto('/auth/login')
	}

	function toggleMenu() {
		menuOpen = !menuOpen
	}

	function closeMenu() {
		menuOpen = false
	}
</script>

{#if session && profile}
	<div class="relative">
		<button
			type="button"
			onclick={toggleMenu}
			class="inline-flex items-center gap-2 rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
			aria-expanded={menuOpen}
			aria-haspopup="true"
		>
			<User class="h-4 w-4" />
			<span>{profile.display_name || 'User'}</span>
			<span
				class="rounded-sm bg-secondary px-1.5 py-0.5 text-xs font-medium text-secondary-foreground"
			>
				{profile.role}
			</span>
		</button>

		{#if menuOpen}
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="fixed inset-0 z-40" onclick={closeMenu} onkeydown={closeMenu}></div>
			<div
				class="absolute right-0 z-50 mt-1 w-48 rounded-md border border-border bg-popover p-1 shadow-lg"
				role="menu"
			>
				<button
					type="button"
					onclick={handleSignOut}
					class="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-popover-foreground hover:bg-accent"
					role="menuitem"
				>
					<LogOut class="h-4 w-4" />
					Sign out
				</button>
			</div>
		{/if}
	</div>
{:else}
	<a
		href="/auth/login"
		class="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
	>
		Sign in
	</a>
{/if}

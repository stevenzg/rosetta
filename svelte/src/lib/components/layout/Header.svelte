<script lang="ts">
	import ThemeToggle from './ThemeToggle.svelte'
	import UserMenu from './UserMenu.svelte'
	import type { UserProfile } from '$lib/types'
	import type { Session } from '@supabase/supabase-js'

	interface Props {
		session: Session | null
		profile: UserProfile | null
	}

	let { session, profile }: Props = $props()
</script>

<header
	class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
>
	<nav
		class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4"
		aria-label="Main navigation"
	>
		<a href="/" class="text-lg font-semibold tracking-tight"> Rosetta </a>

		<div class="flex items-center gap-2">
			<ThemeToggle />
			<UserMenu {session} {profile} />
		</div>
	</nav>
</header>

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

<header class="border-b border-border bg-background">
	<div class="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
		<a href="/" class="text-lg font-semibold text-foreground"> Rosetta </a>

		<nav class="flex items-center gap-3" aria-label="Main navigation">
			{#if session}
				<a
					href="/articles"
					class="text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					Articles
				</a>
			{/if}
			<ThemeToggle />
			<UserMenu {session} {profile} />
		</nav>
	</div>
</header>

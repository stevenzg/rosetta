<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte'
	import { theme } from '$lib/stores/theme.svelte'
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
	aria-label={theme.current === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
>
	{#if theme.current === 'light'}
		<Sun class="h-4 w-4" />
	{:else}
		<Moon class="h-4 w-4" />
	{/if}
</button>

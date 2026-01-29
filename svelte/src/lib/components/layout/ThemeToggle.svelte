<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte'
	import { theme } from '$lib/stores/theme.svelte'
</script>

<button
	type="button"
	onclick={() => theme.toggle()}
	class="relative inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
	aria-label={theme.current === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
>
	<Sun
		class="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0"
	/>
	<Moon
		class="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100"
	/>
</button>

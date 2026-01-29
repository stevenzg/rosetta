<script lang="ts">
	import { goto } from '$app/navigation'
	import { onMount } from 'svelte'

	let { data } = $props()

	onMount(() => {
		if (data.session) {
			goto('/articles')
		}
	})
</script>

<div class="flex flex-col items-center justify-center py-20">
	<h1 class="mb-4 text-4xl font-bold text-foreground">Rosetta</h1>
	<p class="mb-8 text-lg text-muted-foreground">Article management platform</p>
	{#if !data.session}
		<a
			href="/auth/login"
			class="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			Sign in to get started
		</a>
	{/if}
</div>

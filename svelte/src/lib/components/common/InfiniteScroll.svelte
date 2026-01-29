<script lang="ts">
	import { onMount } from 'svelte'

	interface Props {
		hasMore: boolean
		loading: boolean
		onLoadMore: () => void
	}

	let { hasMore, loading, onLoadMore }: Props = $props()
	let sentinel: HTMLDivElement | undefined = $state()

	onMount(() => {
		if (!sentinel) return

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && hasMore && !loading) {
					onLoadMore()
				}
			},
			{ rootMargin: '200px' }
		)

		observer.observe(sentinel)
		return () => observer.disconnect()
	})
</script>

<div bind:this={sentinel} class="py-4" aria-hidden="true">
	{#if loading}
		<div class="flex justify-center" aria-live="polite">
			<div
				class="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"
				role="status"
			>
				<span class="sr-only">Loading more articles</span>
			</div>
		</div>
	{/if}
</div>

{#if !hasMore && !loading}
	<p class="py-4 text-center text-sm text-muted-foreground" aria-live="polite">
		All articles loaded
	</p>
{/if}

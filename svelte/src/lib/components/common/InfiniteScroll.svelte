<script lang="ts">
	interface Props {
		hasMore: boolean
		loading: boolean
		onLoadMore: () => void
	}

	let { hasMore, loading, onLoadMore }: Props = $props()
	let sentinel: HTMLDivElement | undefined = $state()

	// Read hasMore and loading in the effect body so Svelte tracks them as
	// reactive dependencies. Without this, the IntersectionObserver callback
	// closure would capture stale values and could trigger spurious loads.
	$effect(() => {
		if (!sentinel) return

		const currentHasMore = hasMore
		const currentLoading = loading

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && currentHasMore && !currentLoading) {
					onLoadMore()
				}
			},
			{ rootMargin: '200px' }
		)

		observer.observe(sentinel)
		return () => observer.disconnect()
	})
</script>

<div bind:this={sentinel} class="py-2" aria-hidden="true"></div>

<script lang="ts">
	interface Props {
		count?: number
	}

	let { count = 5 }: Props = $props()
</script>

<div role="status" aria-label="Loading articles" class="space-y-3">
	<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
	{#each Array(count) as _, i (i)}
		<div class="flex items-center justify-between gap-4 rounded-lg border p-4">
			<div class="min-w-0 flex-1 space-y-2">
				<div class="h-5 w-3/4 animate-pulse rounded-md bg-accent"></div>
				<div class="flex flex-wrap gap-x-4 gap-y-1">
					<div class="h-4 w-20 animate-pulse rounded-md bg-accent"></div>
					<div class="h-4 w-24 animate-pulse rounded-md bg-accent"></div>
					<div class="h-4 w-32 animate-pulse rounded-md bg-accent"></div>
				</div>
			</div>
			<div class="flex shrink-0 gap-1">
				<div class="h-8 w-8 animate-pulse rounded-md bg-accent"></div>
				<div class="h-8 w-8 animate-pulse rounded-md bg-accent"></div>
			</div>
		</div>
	{/each}
	<span class="sr-only">Loading articles, please wait...</span>
</div>

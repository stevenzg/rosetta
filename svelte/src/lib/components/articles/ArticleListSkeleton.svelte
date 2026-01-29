<script lang="ts">
	interface Props {
		rows?: number
	}

	let { rows = 5 }: Props = $props()
</script>

<div aria-busy="true" aria-label="Loading articles">
	<table class="w-full text-sm">
		<thead>
			<tr class="border-b border-border text-left">
				<th scope="col" class="px-3 py-3 font-medium text-muted-foreground">ID</th>
				<th scope="col" class="px-3 py-3 font-medium text-muted-foreground">Title</th>
				<th scope="col" class="px-3 py-3 font-medium text-muted-foreground">Status</th>
				<th scope="col" class="px-3 py-3 font-medium text-muted-foreground">Author</th>
				<th scope="col" class="px-3 py-3 font-medium text-muted-foreground">Created</th>
				<th scope="col" class="px-3 py-3 font-medium text-muted-foreground">
					<span class="sr-only">Actions</span>
				</th>
			</tr>
		</thead>
		<tbody>
			{#each Array(rows) as _, i (i)}
				<tr class="border-b border-border">
					<td class="px-3 py-3">
						<div class="h-4 w-16 animate-pulse rounded bg-muted"></div>
					</td>
					<td class="px-3 py-3">
						<div class="h-4 w-48 animate-pulse rounded bg-muted"></div>
					</td>
					<td class="px-3 py-3">
						<div class="h-5 w-16 animate-pulse rounded-full bg-muted"></div>
					</td>
					<td class="px-3 py-3">
						<div class="h-4 w-24 animate-pulse rounded bg-muted"></div>
					</td>
					<td class="px-3 py-3">
						<div class="h-4 w-20 animate-pulse rounded bg-muted"></div>
					</td>
					<td class="px-3 py-3">
						<div class="h-4 w-16 animate-pulse rounded bg-muted"></div>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

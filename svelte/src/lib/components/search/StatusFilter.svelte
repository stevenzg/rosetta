<script lang="ts">
	import { STATUS_OPTIONS } from '$lib/constants'
	import type { StatusFilter as StatusFilterType } from '$lib/types'

	interface Props {
		value: StatusFilterType
		onChange: (value: StatusFilterType) => void
	}

	let { value, onChange }: Props = $props()

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement
		onChange(target.value as StatusFilterType)
	}
</script>

<div class="flex items-center gap-2">
	<label for="status-filter" class="text-sm font-medium text-muted-foreground">Status:</label>
	<select
		id="status-filter"
		{value}
		onchange={handleChange}
		class="rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:ring-2 focus:ring-ring focus:outline-none"
	>
		{#each STATUS_OPTIONS as option (option.value)}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>

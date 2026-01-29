<script lang="ts">
	import { STATUS_OPTIONS } from '$lib/constants'
	import type { StatusFilter as StatusFilterType } from '$lib/types'

	interface Props {
		value: StatusFilterType
		onChange: (value: StatusFilterType) => void
	}

	let { value, onChange }: Props = $props()
</script>

<div
	role="radiogroup"
	aria-label="Filter articles by status"
	class="flex h-9 items-center gap-0.5 rounded-lg bg-muted p-[3px] sm:inline-flex"
>
	{#each STATUS_OPTIONS as option (option.value)}
		<button
			type="button"
			role="radio"
			aria-checked={value === option.value}
			onclick={() => onChange(option.value as StatusFilterType)}
			class="h-full flex-1 rounded-md px-3 text-sm font-medium sm:flex-initial {value ===
			option.value
				? 'bg-background text-foreground shadow-sm'
				: 'text-foreground/70 hover:text-foreground'}"
		>
			{option.label}
		</button>
	{/each}
</div>

<script lang="ts">
	import { Search, X } from 'lucide-svelte'
	import { debounce } from '$lib/utils/debounce'
	import { DEBOUNCE_MS } from '$lib/constants'

	interface Props {
		value: string
		onSearch: (value: string) => void
	}

	let { value, onSearch }: Props = $props()
	let inputValue = $state(value)

	const debouncedSearch = debounce((val: string) => {
		onSearch(val)
	}, DEBOUNCE_MS)

	function handleInput(e: Event) {
		const target = e.target as HTMLInputElement
		inputValue = target.value
		debouncedSearch(inputValue)
	}

	function handleClear() {
		inputValue = ''
		onSearch('')
	}

	$effect(() => {
		inputValue = value
	})
</script>

<div role="search" class="relative">
	<Search
		class="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
	/>
	<input
		type="search"
		value={inputValue}
		oninput={handleInput}
		class="w-full rounded-md border border-input bg-background py-2 pr-8 pl-9 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring focus:outline-none"
		placeholder="Search articles by title..."
		aria-label="Search articles by title"
	/>
	{#if inputValue}
		<button
			type="button"
			onclick={handleClear}
			class="absolute top-1/2 right-2 inline-flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground"
			aria-label="Clear search"
		>
			<X class="h-3 w-3" />
		</button>
	{/if}
</div>

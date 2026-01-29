<script lang="ts">
	import { AlertCircle } from 'lucide-svelte'

	interface Props {
		message: string
		onRetry?: () => void
	}

	let { message, onRetry }: Props = $props()
</script>

<div class="flex flex-col items-center gap-3 py-8" role="alert">
	<AlertCircle class="h-8 w-8 text-destructive" />
	<p class="text-sm text-muted-foreground">{message}</p>
	{#if onRetry}
		<button
			type="button"
			onclick={onRetry}
			class="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
		>
			Try again
		</button>
	{/if}
</div>

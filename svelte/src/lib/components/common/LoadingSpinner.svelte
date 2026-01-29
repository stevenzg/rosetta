<script lang="ts">
	interface Props {
		size?: 'sm' | 'md' | 'lg'
		label?: string
	}

	let { size = 'md', label = 'Loading' }: Props = $props()

	const sizeClasses = {
		sm: 'h-4 w-4 border',
		md: 'h-6 w-6 border-2',
		lg: 'h-8 w-8 border-2'
	}
</script>

<div class="flex items-center justify-center" role="status">
	<div
		class="animate-spin rounded-full border-muted-foreground border-t-transparent {sizeClasses[size]}"
	></div>
	<span class="sr-only">{label}</span>
</div>

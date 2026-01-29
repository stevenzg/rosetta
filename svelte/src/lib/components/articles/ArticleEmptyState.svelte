<script lang="ts">
	import { FileText } from 'lucide-svelte'

	interface Props {
		message?: string
	}

	let { message = 'No articles found' }: Props = $props()
</script>

<div class="flex flex-col items-center gap-3 py-16 text-center" role="status">
	<FileText class="h-12 w-12 text-muted-foreground/50" />
	<p class="text-sm text-muted-foreground">{message}</p>
</div>

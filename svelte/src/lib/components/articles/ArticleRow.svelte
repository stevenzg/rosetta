<script lang="ts">
	import { Pencil, Trash2 } from 'lucide-svelte'
	import { formatDate } from '$lib/utils/date'
	import type { Article, UserRole } from '$lib/types'

	interface Props {
		article: Article
		userRole: UserRole
		onEdit: (article: Article) => void
		onDelete: (article: Article) => void
	}

	let { article, userRole, onEdit, onDelete }: Props = $props()

	const isEditor = $derived(userRole === 'editor')
	const statusClass = $derived(
		article.status === 'published'
			? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
			: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
	)
</script>

<tr class="border-b border-border transition-colors hover:bg-muted/50">
	<td class="px-3 py-3 font-mono text-xs text-muted-foreground">
		{article.id.slice(0, 8)}
	</td>
	<td class="px-3 py-3 font-medium text-foreground">
		{article.title}
	</td>
	<td class="px-3 py-3">
		<span
			class="inline-flex rounded-full px-2 py-0.5 text-xs font-medium {statusClass}"
			aria-label="Status: {article.status}"
		>
			{article.status}
		</span>
	</td>
	<td class="px-3 py-3 text-muted-foreground">
		{article.profiles?.display_name ?? 'Unknown'}
	</td>
	<td class="px-3 py-3 text-muted-foreground">
		{formatDate(article.created_at)}
	</td>
	<td class="px-3 py-3">
		{#if isEditor}
			<div class="flex items-center gap-1">
				<button
					type="button"
					onclick={() => onEdit(article)}
					class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					aria-label="Edit article: {article.title}"
				>
					<Pencil class="h-4 w-4" />
				</button>
				<button
					type="button"
					onclick={() => onDelete(article)}
					class="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					aria-label="Delete article: {article.title}"
				>
					<Trash2 class="h-4 w-4" />
				</button>
			</div>
		{/if}
	</td>
</tr>

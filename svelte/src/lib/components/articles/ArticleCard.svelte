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
	const authorName = $derived(article.profiles?.display_name ?? 'Unknown')
</script>

<article
	class="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
>
	<div class="min-w-0 flex-1">
		<div class="flex items-center gap-2">
			<h2 class="truncate font-medium">{article.title}</h2>
			{#if article.status === 'draft'}
				<span
					class="inline-flex shrink-0 rounded-md bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
					aria-label="Status: draft"
				>
					draft
				</span>
			{/if}
		</div>
		<div class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
			<span aria-label="Author: {authorName}">By {authorName}</span>
			<time datetime={article.created_at} aria-label="Created: {formatDate(article.created_at)}">
				{formatDate(article.created_at)}
			</time>
		</div>
	</div>

	<div class="flex shrink-0 gap-1 {isEditor ? '' : 'invisible'}">
		<button
			type="button"
			onclick={() => onEdit(article)}
			class="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			aria-label="Edit article: {article.title}"
			tabindex={isEditor ? 0 : -1}
		>
			<Pencil class="h-4 w-4" />
		</button>
		<button
			type="button"
			onclick={() => onDelete(article)}
			class="inline-flex h-9 w-9 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
			aria-label="Delete article: {article.title}"
			tabindex={isEditor ? 0 : -1}
		>
			<Trash2 class="h-4 w-4" />
		</button>
	</div>
</article>

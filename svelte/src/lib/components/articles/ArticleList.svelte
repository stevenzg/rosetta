<script lang="ts">
	import ArticleRow from './ArticleRow.svelte'
	import ArticleListSkeleton from './ArticleListSkeleton.svelte'
	import ArticleEmptyState from './ArticleEmptyState.svelte'
	import InfiniteScroll from '$lib/components/common/InfiniteScroll.svelte'
	import ErrorMessage from '$lib/components/common/ErrorMessage.svelte'
	import type { Article, UserRole } from '$lib/types'

	interface Props {
		articles: Article[]
		loading: boolean
		loadingMore: boolean
		hasMore: boolean
		error: string | null
		userRole: UserRole
		onLoadMore: () => void
		onRetry: () => void
		onEdit: (article: Article) => void
		onDelete: (article: Article) => void
	}

	let {
		articles,
		loading,
		loadingMore,
		hasMore,
		error,
		userRole,
		onLoadMore,
		onRetry,
		onEdit,
		onDelete
	}: Props = $props()
</script>

{#if loading}
	<ArticleListSkeleton />
{:else if error}
	<ErrorMessage message={error} onRetry={onRetry} />
{:else if articles.length === 0}
	<ArticleEmptyState />
{:else}
	<div aria-busy={loadingMore}>
		<table class="w-full text-sm" aria-label="Articles">
			<caption class="sr-only">List of articles</caption>
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
				{#each articles as article (article.id)}
					<ArticleRow {article} {userRole} {onEdit} {onDelete} />
				{/each}
			</tbody>
		</table>

		<InfiniteScroll {hasMore} loading={loadingMore} {onLoadMore} />
	</div>

	<div class="sr-only" aria-live="polite">
		{articles.length} articles loaded
	</div>
{/if}

<script lang="ts">
	import ArticleCard from './ArticleCard.svelte'
	import ArticleListSkeleton from './ArticleListSkeleton.svelte'
	import InfiniteScroll from '$lib/components/common/InfiniteScroll.svelte'
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

{#if error && !loading}
	<div
		class="flex flex-col items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center"
		role="alert"
	>
		<p class="text-sm text-destructive">Something went wrong: {error}</p>
		<button
			type="button"
			onclick={onRetry}
			class="inline-flex items-center rounded-md border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
		>
			Retry
		</button>
	</div>
{/if}

{#if loading}
	<ArticleListSkeleton count={5} />
{:else if articles.length === 0 && !error}
	<p class="py-12 text-center text-muted-foreground">No articles found.</p>
{:else}
	<div aria-busy={loadingMore} aria-live="polite">
		<div class="space-y-3">
			{#each articles as article (article.id)}
				<ArticleCard {article} {userRole} {onEdit} {onDelete} />
			{/each}
		</div>

		{#if loadingMore}
			<div class="py-2">
				<ArticleListSkeleton count={3} />
			</div>
		{/if}

		<InfiniteScroll {hasMore} loading={loadingMore} {onLoadMore} />

		{#if !hasMore && articles.length > 0}
			<p class="py-4 text-center text-sm text-muted-foreground">All articles loaded.</p>
		{/if}
	</div>
{/if}

<script lang="ts">
	import { Plus } from 'lucide-svelte'
	import ArticleList from '$lib/components/articles/ArticleList.svelte'
	import ArticleFormDialog from '$lib/components/articles/ArticleFormDialog.svelte'
	import ArticleDeleteDialog from '$lib/components/articles/ArticleDeleteDialog.svelte'
	import SearchInput from '$lib/components/search/SearchInput.svelte'
	import StatusFilter from '$lib/components/search/StatusFilter.svelte'
	import { getClient } from '$lib/supabase/client'
	import { fetchArticles, createArticle, updateArticle, deleteArticle } from '$lib/services/articles'
	import type { Article, ArticleCreate, StatusFilter as StatusFilterType } from '$lib/types'

	let { data } = $props()

	const supabase = getClient()
	const profile = $derived(data.profile)
	const userRole = $derived(profile?.role ?? 'viewer')
	const isEditor = $derived(userRole === 'editor')

	let articles = $state<Article[]>(data.articles)
	let totalCount = $state(data.totalCount)
	let page = $state(0)
	let loading = $state(false)
	let loadingMore = $state(false)
	let error = $state<string | null>(null)
	let searchQuery = $state('')
	let statusFilter = $state<StatusFilterType>('all')

	let formDialogOpen = $state(false)
	let editingArticle = $state<Article | null>(null)
	let formError = $state<string | null>(null)
	let deleteDialogOpen = $state(false)
	let deletingArticle = $state<Article | null>(null)
	let deleteError = $state<string | null>(null)

	const hasMore = $derived(articles.length < totalCount)

	async function loadArticles(reset = false) {
		const targetPage = reset ? 0 : page + 1
		const isMore = !reset

		if (isMore) {
			loadingMore = true
		} else {
			loading = true
		}
		error = null

		try {
			const result = await fetchArticles(supabase, {
				page: targetPage,
				search: searchQuery || undefined,
				status: statusFilter !== 'all' ? statusFilter : undefined
			})

			if (reset) {
				articles = result.articles
			} else {
				articles = [...articles, ...result.articles]
			}
			totalCount = result.count
			page = targetPage
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load articles'
		} finally {
			loading = false
			loadingMore = false
		}
	}

	function handleSearch(value: string) {
		searchQuery = value
		page = 0
		loadArticles(true)
	}

	function handleFilterChange(value: StatusFilterType) {
		statusFilter = value
		page = 0
		loadArticles(true)
	}

	function handleLoadMore() {
		if (!loadingMore && hasMore) {
			loadArticles(false)
		}
	}

	function handleRetry() {
		loadArticles(true)
	}

	function openCreateDialog() {
		editingArticle = null
		formError = null
		formDialogOpen = true
	}

	function openEditDialog(article: Article) {
		editingArticle = article
		formError = null
		formDialogOpen = true
	}

	function openDeleteDialog(article: Article) {
		deletingArticle = article
		deleteDialogOpen = true
	}

	async function handleFormSubmit(formData: ArticleCreate) {
		if (!data.session) return

		formError = null
		try {
			if (editingArticle) {
				const updated = await updateArticle(supabase, editingArticle.id, formData)
				articles = articles.map((a) => (a.id === updated.id ? updated : a))
			} else {
				const created = await createArticle(supabase, data.session.user.id, formData)
				articles = [created, ...articles]
				totalCount += 1
			}
			formDialogOpen = false
		} catch (err) {
			formError = err instanceof Error ? err.message : 'Failed to save article'
		}
	}

	async function handleDeleteConfirm() {
		if (!deletingArticle) return

		const id = deletingArticle.id
		deleteError = null
		try {
			await deleteArticle(supabase, id)
			articles = articles.filter((a) => a.id !== id)
			totalCount -= 1
			deleteDialogOpen = false
			deletingArticle = null
		} catch (err) {
			deleteError = err instanceof Error ? err.message : 'Failed to delete article'
		}
	}
</script>

<svelte:head>
	<title>Rosetta - Article Management Platform</title>
	<meta name="description" content="Browse, create, and manage your articles on Rosetta." />
	<meta property="og:title" content="Rosetta - Article Management Platform" />
	<meta property="og:description" content="Browse, create, and manage your articles on Rosetta." />
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold tracking-tight">Articles</h1>
		<button
			type="button"
			onclick={openCreateDialog}
			class="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 {isEditor ? '' : 'invisible'}"
			tabindex={isEditor ? 0 : -1}
		>
			<Plus class="mr-1 h-4 w-4" aria-hidden="true" />
			Add
		</button>
	</div>

	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="relative w-full sm:max-w-xs">
			<SearchInput value={searchQuery} onSearch={handleSearch} />
		</div>
		<StatusFilter value={statusFilter} onChange={handleFilterChange} />
	</div>

	<ArticleList
		{articles}
		{loading}
		{loadingMore}
		{hasMore}
		{error}
		{userRole}
		onLoadMore={handleLoadMore}
		onRetry={handleRetry}
		onEdit={openEditDialog}
		onDelete={openDeleteDialog}
	/>

	<ArticleFormDialog
		open={formDialogOpen}
		article={editingArticle}
		error={formError}
		onClose={() => {
			formDialogOpen = false
			formError = null
		}}
		onSubmit={handleFormSubmit}
	/>

	<ArticleDeleteDialog
		open={deleteDialogOpen}
		article={deletingArticle}
		error={deleteError}
		onClose={() => {
			deleteDialogOpen = false
			deletingArticle = null
			deleteError = null
		}}
		onConfirm={handleDeleteConfirm}
	/>
</div>

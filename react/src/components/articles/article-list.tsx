'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ArticleCard } from '@/components/articles/article-card'
import { ArticleDialog } from '@/components/articles/article-dialog'
import { ArticleDeleteDialog } from '@/components/articles/article-delete-dialog'
import { ArticleFilters } from '@/components/articles/article-filters'
import { ArticleListSkeleton } from '@/components/articles/article-list-skeleton'
import { useArticles } from '@/hooks/use-articles'
import { useArticleMutations } from '@/hooks/use-article-mutations'
import { useUser } from '@/hooks/use-user'
import type { Article, ArticleFormData } from '@/lib/types/articles'

export function ArticleList() {
  const { isEditor, isLoading: isUserLoading } = useUser()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')

  const {
    articles,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    fetchNextPage,
    retry,
    setArticles,
  } = useArticles({ search, status })

  const {
    createArticle,
    updateArticle,
    deleteArticle,
    state: mutationState,
  } = useArticleMutations()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create')
  const [editingArticle, setEditingArticle] = useState<Article | undefined>()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingArticle, setDeletingArticle] = useState<Article | null>(null)

  const sentinelRef = useRef<HTMLDivElement>(null)
  const createBtnRef = useRef<HTMLButtonElement>(null)

  // Infinite scroll observer
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel || !hasMore) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading && !isLoadingMore) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMore, isLoading, isLoadingMore, fetchNextPage])

  const handleCreate = useCallback(() => {
    setDialogMode('create')
    setEditingArticle(undefined)
    setDialogOpen(true)
  }, [])

  const handleEdit = useCallback((article: Article) => {
    setDialogMode('edit')
    setEditingArticle(article)
    setDialogOpen(true)
  }, [])

  const handleDeleteClick = useCallback((article: Article) => {
    setDeletingArticle(article)
    setDeleteDialogOpen(true)
  }, [])

  const handleFormSubmit = useCallback(
    async (data: ArticleFormData) => {
      if (dialogMode === 'create') {
        const newArticle = await createArticle(data)
        if (newArticle) {
          setArticles((prev) => [newArticle, ...prev])
          setDialogOpen(false)
          toast.success('Article created successfully')
        } else {
          toast.error(mutationState.error ?? 'Failed to create article')
        }
      } else if (editingArticle) {
        const updated = await updateArticle(editingArticle.id, data)
        if (updated) {
          setArticles((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          )
          setDialogOpen(false)
          toast.success('Article updated successfully')
        } else {
          toast.error(mutationState.error ?? 'Failed to update article')
        }
      }
    },
    [
      dialogMode,
      editingArticle,
      createArticle,
      updateArticle,
      setArticles,
      mutationState.error,
    ]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingArticle) return
    const success = await deleteArticle(deletingArticle.id)
    if (success) {
      setArticles((prev) => prev.filter((a) => a.id !== deletingArticle.id))
      setDeleteDialogOpen(false)
      setDeletingArticle(null)
      toast.success('Article deleted successfully')
      createBtnRef.current?.focus()
    } else {
      toast.error(mutationState.error ?? 'Failed to delete article')
    }
  }, [deletingArticle, deleteArticle, setArticles, mutationState.error])

  if (isUserLoading) {
    return <ArticleListSkeleton count={5} />
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
        {isEditor && (
          <Button ref={createBtnRef} onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Create Article
          </Button>
        )}
      </div>

      <ArticleFilters
        currentSearch={search}
        currentStatus={status}
        onSearchChange={setSearch}
        onStatusChange={setStatus}
      />

      {error && !isLoading && (
        <div
          className="flex flex-col items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center"
          role="alert"
        >
          <p className="text-sm text-destructive">
            Something went wrong: {error}
          </p>
          <Button variant="outline" size="sm" onClick={retry}>
            <RefreshCw className="mr-2 h-4 w-4" aria-hidden="true" />
            Retry
          </Button>
        </div>
      )}

      {isLoading ? (
        <ArticleListSkeleton count={5} />
      ) : (
        <div aria-busy={isLoadingMore} aria-live="polite" className="space-y-3">
          {articles.length === 0 && !error ? (
            <p className="py-12 text-center text-muted-foreground">
              No articles found.
            </p>
          ) : (
            articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                isEditor={isEditor}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))
          )}

          {isLoadingMore && <ArticleListSkeleton count={3} />}

          {hasMore && !isLoadingMore && !error && (
            <div ref={sentinelRef} aria-hidden="true" className="h-4" />
          )}

          {!hasMore && articles.length > 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              All articles loaded.
            </p>
          )}
        </div>
      )}

      <ArticleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        mode={dialogMode}
        article={editingArticle}
        onSubmit={handleFormSubmit}
        isSubmitting={mutationState.isSubmitting}
      />

      <ArticleDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        article={deletingArticle}
        onConfirm={handleDeleteConfirm}
        isSubmitting={mutationState.isSubmitting}
      />
    </div>
  )
}

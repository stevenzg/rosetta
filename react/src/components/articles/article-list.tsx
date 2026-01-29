'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
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

interface ArticleListProps {
  initialArticles?: Article[]
}

export function ArticleList({ initialArticles }: ArticleListProps) {
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
  } = useArticles({ search, status, initialArticles })

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

  const [createBtn, setCreateBtn] = useState<HTMLButtonElement | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const ITEM_HEIGHT = 85 // ~73px card + 12px gap

  const virtualizer = useWindowVirtualizer({
    count: articles.length,
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
    scrollMargin: listRef.current?.offsetTop ?? 0,
  })

  // Fetch next page when scrolling near the end
  useEffect(() => {
    const virtualItems = virtualizer.getVirtualItems()
    const lastItem = virtualItems[virtualItems.length - 1]
    if (
      lastItem &&
      lastItem.index >= articles.length - 3 &&
      hasMore &&
      !isLoading &&
      !isLoadingMore
    ) {
      fetchNextPage()
    }
  }, [
    virtualizer.getVirtualItems(),
    articles.length,
    hasMore,
    isLoading,
    isLoadingMore,
    fetchNextPage,
  ])

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
        const result = await createArticle(data)
        const created = result.data
        if (created) {
          setArticles((prev) => [created, ...prev])
          setDialogOpen(false)
          toast.success('Article created successfully')
        } else {
          toast.error(result.error ?? 'Failed to create article')
        }
      } else if (editingArticle) {
        const result = await updateArticle(editingArticle.id, data)
        const updated = result.data
        if (updated) {
          setArticles((prev) =>
            prev.map((a) => (a.id === updated.id ? updated : a))
          )
          setDialogOpen(false)
          toast.success('Article updated successfully')
        } else {
          toast.error(result.error ?? 'Failed to update article')
        }
      }
    },
    [dialogMode, editingArticle, createArticle, updateArticle, setArticles]
  )

  const handleDeleteConfirm = useCallback(async () => {
    if (!deletingArticle) return
    const result = await deleteArticle(deletingArticle.id)
    if (result.data) {
      setArticles((prev) => prev.filter((a) => a.id !== deletingArticle.id))
      setDeleteDialogOpen(false)
      setDeletingArticle(null)
      toast.success('Article deleted successfully')
      createBtn?.focus()
    } else {
      toast.error(result.error ?? 'Failed to delete article')
    }
  }, [deletingArticle, deleteArticle, setArticles])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
        <Button
          size="sm"
          ref={setCreateBtn}
          onClick={handleCreate}
          className={isUserLoading || !isEditor ? 'invisible' : ''}
          tabIndex={isUserLoading || !isEditor ? -1 : 0}
        >
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
          Add
        </Button>
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
      ) : articles.length === 0 && !error ? (
        <p className="py-12 text-center text-muted-foreground">
          No articles found.
        </p>
      ) : (
        <div ref={listRef} aria-busy={isLoadingMore} aria-live="polite">
          <div
            className="relative w-full"
            style={{ height: virtualizer.getTotalSize() }}
          >
            {virtualizer.getVirtualItems().map((virtualRow) => {
              const article = articles[virtualRow.index]
              return (
                <div
                  key={article.id}
                  className="absolute left-0 top-0 w-full"
                  style={{
                    height: virtualRow.size,
                    transform: `translateY(${virtualRow.start - virtualizer.options.scrollMargin}px)`,
                  }}
                >
                  <ArticleCard
                    article={article}
                    isEditor={isEditor}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                  />
                </div>
              )
            })}
          </div>

          {isLoadingMore && (
            <div className="py-2">
              <ArticleListSkeleton count={3} />
            </div>
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

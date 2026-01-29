'use client'

import { memo } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Article } from '@/lib/types/articles'

interface ArticleCardProps {
  article: Article
  isEditor: boolean
  onEdit: (article: Article) => void
  onDelete: (article: Article) => void
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const ArticleCard = memo(function ArticleCard({
  article,
  isEditor,
  onEdit,
  onDelete,
}: ArticleCardProps) {
  const authorName = article.profiles?.display_name ?? 'Unknown'

  return (
    <article className="flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h2 className="truncate font-medium">{article.title}</h2>
          {article.status === 'draft' && (
            <Badge variant="secondary" aria-label="Status: draft">
              draft
            </Badge>
          )}
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span aria-label={`Author: ${authorName}`}>By {authorName}</span>
          <time
            dateTime={article.created_at}
            aria-label={`Created: ${formatDate(article.created_at)}`}
          >
            {formatDate(article.created_at)}
          </time>
        </div>
      </div>

      <div className={`flex shrink-0 gap-1 ${isEditor ? '' : 'invisible'}`}>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(article)}
          aria-label={`Edit article: ${article.title}`}
          tabIndex={isEditor ? 0 : -1}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(article)}
          aria-label={`Delete article: ${article.title}`}
          tabIndex={isEditor ? 0 : -1}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </article>
  )
})

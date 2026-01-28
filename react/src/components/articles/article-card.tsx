'use client'

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

export function ArticleCard({
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
          <h3 className="truncate font-medium">{article.title}</h3>
          <Badge
            variant={article.status === 'published' ? 'default' : 'secondary'}
            aria-label={`Status: ${article.status}`}
          >
            {article.status}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
          <span
            className="truncate"
            aria-label={`Article ID: ${article.id.slice(0, 8)}`}
          >
            ID: {article.id.slice(0, 8)}
          </span>
          <span aria-label={`Author: ${authorName}`}>By {authorName}</span>
          <time
            dateTime={article.created_at}
            aria-label={`Created: ${formatDate(article.created_at)}`}
          >
            {formatDate(article.created_at)}
          </time>
        </div>
      </div>

      {isEditor && (
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(article)}
            aria-label={`Edit article: ${article.title}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(article)}
            aria-label={`Delete article: ${article.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </article>
  )
}

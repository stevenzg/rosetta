'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArticleForm } from '@/components/articles/article-form'
import type { Article, ArticleFormData } from '@/lib/types/articles'

interface ArticleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'edit'
  article?: Article
  onSubmit: (data: ArticleFormData) => Promise<void>
  isSubmitting: boolean
}

export function ArticleDialog({
  open,
  onOpenChange,
  mode,
  article,
  onSubmit,
  isSubmitting,
}: ArticleDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Article' : 'Edit Article'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {mode === 'create'
              ? 'Fill out the form to create a new article.'
              : 'Modify the fields below to update this article.'}
          </DialogDescription>
        </DialogHeader>
        <ArticleForm
          key={article?.id ?? 'create'}
          mode={mode}
          defaultValues={article}
          onSubmit={onSubmit}
          onCancel={() => onOpenChange(false)}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  )
}

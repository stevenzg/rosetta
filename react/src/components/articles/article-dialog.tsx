'use client'

import {
  Dialog,
  DialogContent,
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
      <DialogContent aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? 'Create Article' : 'Edit Article'}
          </DialogTitle>
        </DialogHeader>
        <ArticleForm
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

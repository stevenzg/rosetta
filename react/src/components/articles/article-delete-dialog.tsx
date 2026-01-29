'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { Article } from '@/lib/types/articles'

interface ArticleDeleteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  article: Article | null
  onConfirm: () => Promise<void>
  isSubmitting: boolean
}

export function ArticleDeleteDialog({
  open,
  onOpenChange,
  article,
  onConfirm,
  isSubmitting,
}: ArticleDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Article</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{article?.title}&quot;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

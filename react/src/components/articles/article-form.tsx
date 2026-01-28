'use client'

import { useCallback, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  Article,
  ArticleFormData,
  ArticleStatus,
} from '@/lib/types/articles'

interface ArticleFormProps {
  mode: 'create' | 'edit'
  defaultValues?: Article
  onSubmit: (data: ArticleFormData) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

interface FormErrors {
  title?: string
}

export function ArticleForm({
  mode,
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
}: ArticleFormProps) {
  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [content, setContent] = useState(defaultValues?.content ?? '')
  const [status, setStatus] = useState<ArticleStatus>(
    defaultValues?.status ?? 'draft'
  )
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {}
    const trimmed = title.trim()

    if (!trimmed) {
      newErrors.title = 'Title is required'
    } else if (trimmed.length > 255) {
      newErrors.title = 'Title must be 255 characters or fewer'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [title])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    await onSubmit({ title: title.trim(), content: content || null, status })
  }

  const titleErrorId = errors.title ? 'title-error' : undefined

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="article-title">
          Title <span aria-hidden="true">*</span>
        </Label>
        <Input
          id="article-title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            if (errors.title) setErrors({})
          }}
          onBlur={validate}
          placeholder="Enter article title"
          aria-required="true"
          aria-invalid={!!errors.title}
          aria-describedby={titleErrorId}
          autoFocus
        />
        {errors.title && (
          <p id="title-error" className="text-sm text-destructive" role="alert">
            {errors.title}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-content">Content</Label>
        <Textarea
          id="article-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter article content"
          rows={6}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="article-status">Status</Label>
        <Select
          value={status}
          onValueChange={(val) => setStatus(val as ArticleStatus)}
        >
          <SelectTrigger id="article-status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'create'
              ? 'Creating...'
              : 'Saving...'
            : mode === 'create'
              ? 'Create Article'
              : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

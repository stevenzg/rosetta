import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ArticleForm } from '../article-form'
import type { Article } from '@/lib/types/articles'

function buildArticle(overrides?: Partial<Article>): Article {
  return {
    id: '1',
    title: 'Test Article',
    content: 'Some content',
    status: 'draft',
    author_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    published_at: null,
    profiles: { display_name: 'Test User' },
    ...overrides,
  }
}

describe('ArticleForm', () => {
  const defaultProps = {
    mode: 'create' as const,
    onSubmit: vi.fn().mockResolvedValue(undefined),
    onCancel: vi.fn(),
    isSubmitting: false,
  }

  it('renders all form fields', () => {
    render(<ArticleForm {...defaultProps} />)
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
  })

  it('shows validation error when title is empty on submit', async () => {
    const user = userEvent.setup()
    render(<ArticleForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create article/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error when title exceeds 255 characters', async () => {
    const user = userEvent.setup()
    render(<ArticleForm {...defaultProps} />)

    const longTitle = 'a'.repeat(256)
    await user.type(screen.getByLabelText(/title/i), longTitle)
    await user.click(screen.getByRole('button', { name: /create article/i }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Title must be 255 characters or fewer'
    )
    expect(defaultProps.onSubmit).not.toHaveBeenCalled()
  })

  it('shows validation error for whitespace-only title', async () => {
    const user = userEvent.setup()
    render(<ArticleForm {...defaultProps} />)

    await user.type(screen.getByLabelText(/title/i), '   ')
    await user.click(screen.getByRole('button', { name: /create article/i }))

    expect(screen.getByRole('alert')).toHaveTextContent('Title is required')
  })

  it('submits form data when valid', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<ArticleForm {...defaultProps} onSubmit={onSubmit} />)

    await user.type(screen.getByLabelText(/title/i), 'My Article')
    await user.click(screen.getByRole('button', { name: /create article/i }))

    expect(onSubmit).toHaveBeenCalledWith({
      title: 'My Article',
      content: null,
      status: 'draft',
    })
  })

  it('pre-populates fields in edit mode', () => {
    const article = buildArticle({
      title: 'Existing',
      content: 'Body text',
      status: 'published',
    })
    render(
      <ArticleForm {...defaultProps} mode="edit" defaultValues={article} />
    )

    expect(screen.getByLabelText(/title/i)).toHaveValue('Existing')
    expect(screen.getByLabelText(/content/i)).toHaveValue('Body text')
  })

  it('calls onCancel when cancel button is clicked', async () => {
    const onCancel = vi.fn()
    const user = userEvent.setup()
    render(<ArticleForm {...defaultProps} onCancel={onCancel} />)

    await user.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalled()
  })

  it('disables submit button when isSubmitting is true', () => {
    render(<ArticleForm {...defaultProps} isSubmitting />)
    expect(screen.getByRole('button', { name: /creating/i })).toBeDisabled()
  })

  it('shows "Saving..." text in edit mode when submitting', () => {
    const article = buildArticle()
    render(
      <ArticleForm
        {...defaultProps}
        mode="edit"
        defaultValues={article}
        isSubmitting
      />
    )
    expect(screen.getByRole('button', { name: /saving/i })).toBeDisabled()
  })

  it('clears validation error when user starts typing', async () => {
    const user = userEvent.setup()
    render(<ArticleForm {...defaultProps} />)

    // Trigger validation error
    await user.click(screen.getByRole('button', { name: /create article/i }))
    expect(screen.getByRole('alert')).toBeInTheDocument()

    // Start typing to clear error
    await user.type(screen.getByLabelText(/title/i), 'a')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('sets aria-invalid on title input when validation fails', async () => {
    const user = userEvent.setup()
    render(<ArticleForm {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /create article/i }))
    expect(screen.getByLabelText(/title/i)).toHaveAttribute(
      'aria-invalid',
      'true'
    )
  })
})

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ArticleCard } from '../article-card'
import type { Article } from '@/lib/types/articles'

function buildArticle(overrides?: Partial<Article>): Article {
  return {
    id: '1',
    title: 'Test Article',
    content: 'Some content',
    status: 'published',
    author_id: 'user-1',
    created_at: '2026-01-15T00:00:00Z',
    updated_at: '2026-01-15T00:00:00Z',
    published_at: '2026-01-15T00:00:00Z',
    profiles: { display_name: 'Jane Doe' },
    ...overrides,
  }
}

describe('ArticleCard', () => {
  const defaultProps = {
    article: buildArticle(),
    isEditor: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  }

  it('renders article title, author, and formatted date', () => {
    render(<ArticleCard {...defaultProps} />)

    expect(screen.getByText('Test Article')).toBeInTheDocument()
    expect(screen.getByText('By Jane Doe')).toBeInTheDocument()
    expect(screen.getByText('Jan 15, 2026')).toBeInTheDocument()
  })

  it('shows "Unknown" when profile is missing', () => {
    const article = buildArticle({ profiles: null })
    render(<ArticleCard {...defaultProps} article={article} />)

    expect(screen.getByText('By Unknown')).toBeInTheDocument()
  })

  it('shows draft badge only for draft articles', () => {
    const { rerender } = render(<ArticleCard {...defaultProps} />)
    expect(screen.queryByText('draft')).not.toBeInTheDocument()

    const draftArticle = buildArticle({ status: 'draft' })
    rerender(<ArticleCard {...defaultProps} article={draftArticle} />)
    expect(screen.getByText('draft')).toBeInTheDocument()
  })

  it('hides edit/delete buttons from non-editors via tabIndex', () => {
    render(<ArticleCard {...defaultProps} isEditor={false} />)

    const editBtn = screen.getByRole('button', {
      name: /edit article/i,
    })
    const deleteBtn = screen.getByRole('button', {
      name: /delete article/i,
    })
    expect(editBtn).toHaveAttribute('tabindex', '-1')
    expect(deleteBtn).toHaveAttribute('tabindex', '-1')
  })

  it('makes edit/delete buttons focusable for editors', () => {
    render(<ArticleCard {...defaultProps} isEditor />)

    const editBtn = screen.getByRole('button', {
      name: /edit article/i,
    })
    const deleteBtn = screen.getByRole('button', {
      name: /delete article/i,
    })
    expect(editBtn).toHaveAttribute('tabindex', '0')
    expect(deleteBtn).toHaveAttribute('tabindex', '0')
  })

  it('calls onEdit with the article when edit button is clicked', async () => {
    const onEdit = vi.fn()
    const user = userEvent.setup()
    const article = buildArticle()
    render(
      <ArticleCard
        {...defaultProps}
        article={article}
        isEditor
        onEdit={onEdit}
      />
    )

    await user.click(screen.getByRole('button', { name: /edit article/i }))
    expect(onEdit).toHaveBeenCalledWith(article)
  })

  it('calls onDelete with the article when delete button is clicked', async () => {
    const onDelete = vi.fn()
    const user = userEvent.setup()
    const article = buildArticle()
    render(
      <ArticleCard
        {...defaultProps}
        article={article}
        isEditor
        onDelete={onDelete}
      />
    )

    await user.click(screen.getByRole('button', { name: /delete article/i }))
    expect(onDelete).toHaveBeenCalledWith(article)
  })
})

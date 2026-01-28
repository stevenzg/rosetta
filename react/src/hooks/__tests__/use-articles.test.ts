import { describe, it, expect, vi, beforeEach } from 'vitest'

// Supabase query builder is fluent — any method can be called in any order
// and the final result is thenable. We create a single builder object that
// returns itself for all chaining methods except the terminal `then`.
const { mockFrom, mockResolvedData } = vi.hoisted(() => {
  let resolvedValue: { data: unknown; error: unknown } = {
    data: [],
    error: null,
  }

  const builder: Record<string, unknown> = {}
  const chainMethod = () => builder
  builder.select = vi.fn(chainMethod)
  builder.order = vi.fn(chainMethod)
  builder.range = vi.fn(chainMethod)
  builder.ilike = vi.fn(chainMethod)
  builder.eq = vi.fn(chainMethod)
  builder.then = vi.fn((resolve: (v: unknown) => void) => {
    return Promise.resolve(resolvedValue).then(resolve)
  })

  const mockFrom = vi.fn(() => builder)
  const mockResolvedData = (val: { data: unknown; error: unknown }) => {
    resolvedValue = val
    // Also update the `then` implementation for subsequent calls
    ;(builder.then as ReturnType<typeof vi.fn>).mockImplementation(
      (resolve: (v: unknown) => void) => Promise.resolve(val).then(resolve)
    )
  }

  return { mockFrom, mockResolvedData }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({ from: mockFrom }),
}))

import { renderHook, waitFor, act } from '@testing-library/react'
import { useArticles } from '../use-articles'
import { PAGE_SIZE } from '@/lib/constants'
import type { Article } from '@/lib/types/articles'

function buildArticle(id: string): Article {
  return {
    id,
    title: `Article ${id}`,
    content: null,
    status: 'published',
    author_id: 'user-1',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    published_at: '2026-01-01T00:00:00Z',
    profiles: { display_name: 'Author' },
  }
}

describe('useArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolvedData({ data: [], error: null })
  })

  it('skips initial fetch when initialArticles are provided', () => {
    const initial = [buildArticle('1')]
    const { result } = renderHook(() =>
      useArticles({ search: '', status: 'all', initialArticles: initial })
    )

    expect(result.current.articles).toHaveLength(1)
    expect(result.current.isLoading).toBe(false)
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('fetches articles when no initialArticles are provided', async () => {
    const articles = Array.from({ length: 5 }, (_, i) =>
      buildArticle(String(i))
    )
    mockResolvedData({ data: articles, error: null })

    const { result } = renderHook(() =>
      useArticles({ search: '', status: 'all' })
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.articles).toHaveLength(5)
    expect(result.current.hasMore).toBe(false)
  })

  it('sets hasMore to true when a full page is returned', async () => {
    const articles = Array.from({ length: PAGE_SIZE }, (_, i) =>
      buildArticle(String(i))
    )
    mockResolvedData({ data: articles, error: null })

    const { result } = renderHook(() =>
      useArticles({ search: '', status: 'all' })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasMore).toBe(true)
  })

  it('sets error state on fetch failure', async () => {
    mockResolvedData({ data: null, error: { message: 'Network error' } })

    const { result } = renderHook(() =>
      useArticles({ search: '', status: 'all' })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.error).toBe('Network error')
    expect(result.current.articles).toHaveLength(0)
  })

  it('refetches when search changes', async () => {
    const { result, rerender } = renderHook(
      ({ search }) => useArticles({ search, status: 'all' }),
      { initialProps: { search: '' } }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    const callCountBefore = mockFrom.mock.calls.length

    rerender({ search: 'test' })

    await waitFor(() => {
      expect(mockFrom.mock.calls.length).toBeGreaterThan(callCountBefore)
    })
  })

  it('appends articles on fetchNextPage', async () => {
    const page1 = Array.from({ length: PAGE_SIZE }, (_, i) =>
      buildArticle(String(i))
    )
    mockResolvedData({ data: page1, error: null })

    const { result } = renderHook(() =>
      useArticles({ search: '', status: 'all' })
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.articles).toHaveLength(PAGE_SIZE)

    // Set up page 2 response
    mockResolvedData({ data: [buildArticle('extra')], error: null })

    act(() => {
      result.current.fetchNextPage()
    })

    await waitFor(() => {
      expect(result.current.articles).toHaveLength(PAGE_SIZE + 1)
    })
  })
})

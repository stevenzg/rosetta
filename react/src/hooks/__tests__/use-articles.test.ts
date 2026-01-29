import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

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
  builder.limit = vi.fn(chainMethod)
  builder.or = vi.fn(chainMethod)
  builder.range = vi.fn(chainMethod)
  builder.abortSignal = vi.fn(chainMethod)
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

// Warm up the dynamic import so the mock module is cached before any test runs.
// fetchArticlesPage uses `await import('@/lib/supabase/client')` to defer the
// 200KB Supabase bundle; the first dynamic resolution must complete before
// React Query can invoke the query function.
beforeAll(async () => {
  await import('@/lib/supabase/client')
})

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

let testQueryClient: QueryClient

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: testQueryClient },
      children
    )
  }
}

describe('useArticles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockResolvedData({ data: [], error: null })
    testQueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
        },
      },
    })
  })

  afterEach(() => {
    testQueryClient.clear()
  })

  it('uses initialArticles without triggering the initial query fetch', () => {
    const initial = [buildArticle('1')]
    const { result } = renderHook(
      () =>
        useArticles({ search: '', status: 'all', initialArticles: initial }),
      { wrapper: createWrapper() }
    )

    // The articles are immediately available from initialData
    expect(result.current.articles).toHaveLength(1)
    expect(result.current.isLoading).toBe(false)
  })

  it('fetches articles when no initialArticles are provided', async () => {
    const articles = Array.from({ length: 5 }, (_, i) =>
      buildArticle(String(i))
    )
    mockResolvedData({ data: articles, error: null })

    const { result } = renderHook(
      () => useArticles({ search: '', status: 'all' }),
      { wrapper: createWrapper() }
    )

    expect(result.current.isLoading).toBe(true)

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.articles).toHaveLength(5)
    expect(result.current.hasNextPage).toBe(false)
  })

  it('sets hasNextPage to true when a full page is returned', async () => {
    const articles = Array.from({ length: PAGE_SIZE }, (_, i) =>
      buildArticle(String(i))
    )
    mockResolvedData({ data: articles, error: null })

    const { result } = renderHook(
      () => useArticles({ search: '', status: 'all' }),
      { wrapper: createWrapper() }
    )

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.hasNextPage).toBe(true)
  })

  it('sets error state on fetch failure', async () => {
    mockResolvedData({ data: null, error: { message: 'Network error' } })

    const { result } = renderHook(
      () => useArticles({ search: '', status: 'all' }),
      { wrapper: createWrapper() }
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
      { initialProps: { search: '' }, wrapper: createWrapper() }
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

    const { result } = renderHook(
      () => useArticles({ search: '', status: 'all' }),
      { wrapper: createWrapper() }
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

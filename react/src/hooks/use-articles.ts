'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { PAGE_SIZE } from '@/lib/constants'
import { type Article, parseArticle } from '@/lib/types/articles'

const supabase = createClient()

interface UseArticlesOptions {
  search: string
  status: string
  initialArticles?: Article[]
}

type Cursor = { createdAt: string; id: string } | null

async function fetchArticlesPage({
  search,
  status,
  cursor,
  signal,
}: {
  search: string
  status: string
  cursor: Cursor
  signal?: AbortSignal
}): Promise<Article[]> {
  let query = supabase
    .from('articles')
    .select(
      'id, title, status, created_at, updated_at, published_at, content, author_id, profiles(display_name)'
    )
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE)

  if (signal) {
    query = query.abortSignal(signal)
  }

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`
    )
  }

  if (search) {
    const escaped = search.replace(/%/g, '\\%').replace(/_/g, '\\_')
    query = query.ilike('title', `%${escaped}%`)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  const rows: unknown[] = (data ?? []) as unknown[]
  return rows.map(parseArticle)
}

function articleQueryKey(search: string, status: string) {
  return ['articles', { search, status }] as const
}

export function useArticles({
  search,
  status,
  initialArticles,
}: UseArticlesOptions) {
  const hasInitial = initialArticles && initialArticles.length > 0

  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    refetch,
  } = useInfiniteQuery({
    queryKey: articleQueryKey(search, status),
    queryFn: ({ pageParam, signal }) =>
      fetchArticlesPage({ search, status, cursor: pageParam, signal }),
    initialPageParam: null as Cursor,
    getNextPageParam: (lastPage) => {
      if (lastPage.length < PAGE_SIZE) return undefined
      const last = lastPage[lastPage.length - 1]
      return { createdAt: last.created_at, id: last.id }
    },
    ...(hasInitial &&
      search === '' &&
      (status === 'all' || status === '') && {
        initialData: {
          pages: [initialArticles],
          pageParams: [null],
        },
      }),
  })

  const articles = data?.pages.flatMap((page) => page) ?? []

  return {
    articles,
    isLoading,
    isFetchingNextPage,
    error: error?.message ?? null,
    hasNextPage: hasNextPage ?? false,
    fetchNextPage,
    retry: refetch,
  }
}

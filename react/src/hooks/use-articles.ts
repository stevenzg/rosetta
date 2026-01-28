'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PAGE_SIZE } from '@/lib/constants'
import type { Article } from '@/lib/types/articles'

interface UseArticlesOptions {
  search: string
  status: string
}

interface UseArticlesReturn {
  articles: Article[]
  isLoading: boolean
  isLoadingMore: boolean
  error: string | null
  hasMore: boolean
  fetchNextPage: () => void
  retry: () => void
  setArticles: React.Dispatch<React.SetStateAction<Article[]>>
}

export function useArticles({
  search,
  status,
}: UseArticlesOptions): UseArticlesReturn {
  const [articles, setArticles] = useState<Article[]>([])
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const abortRef = useRef(0)

  const fetchPage = useCallback(
    async (pageNum: number, reset = false) => {
      const fetchId = ++abortRef.current

      if (reset) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      const offset = pageNum * PAGE_SIZE

      let query = supabase
        .from('articles')
        .select(
          'id, title, status, created_at, updated_at, published_at, content, author_id, profiles(display_name)'
        )
        .order('created_at', { ascending: false })
        .range(offset, offset + PAGE_SIZE - 1)

      if (search) {
        query = query.ilike('title', `%${search}%`)
      }
      if (status && status !== 'all') {
        query = query.eq('status', status)
      }

      const { data, error: fetchError } = await query

      if (fetchId !== abortRef.current) return

      if (fetchError) {
        setError(fetchError.message)
      } else {
        const fetched = (data ?? []) as unknown as Article[]
        setArticles((prev) => (reset ? fetched : [...prev, ...fetched]))
        setHasMore(fetched.length === PAGE_SIZE)
        setPage(pageNum)
      }

      setIsLoading(false)
      setIsLoadingMore(false)
    },
    [supabase, search, status]
  )

  useEffect(() => {
    setPage(0)
    setHasMore(true)
    fetchPage(0, true)
  }, [fetchPage])

  const fetchNextPage = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchPage(page + 1)
    }
  }, [fetchPage, page, isLoadingMore, hasMore])

  const retry = useCallback(() => {
    fetchPage(page, page === 0)
  }, [fetchPage, page])

  return {
    articles,
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    fetchNextPage,
    retry,
    setArticles,
  }
}

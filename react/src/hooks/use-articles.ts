'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PAGE_SIZE } from '@/lib/constants'
import { type Article, parseArticle } from '@/lib/types/articles'

const supabase = createClient()

interface UseArticlesOptions {
  search: string
  status: string
  initialArticles?: Article[]
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
  initialArticles,
}: UseArticlesOptions): UseArticlesReturn {
  const hasInitial = initialArticles && initialArticles.length > 0
  const [articles, setArticles] = useState<Article[]>(initialArticles ?? [])
  const [hasMore, setHasMore] = useState(
    hasInitial ? initialArticles.length === PAGE_SIZE : true
  )
  const [isLoading, setIsLoading] = useState(!hasInitial)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const abortRef = useRef(0)
  const abortControllerRef = useRef<AbortController | null>(null)

  const fetchArticles = useCallback(
    async (cursor: { createdAt: string; id: string } | null, reset = false) => {
      const fetchId = ++abortRef.current

      // Cancel any in-flight request before starting a new one
      abortControllerRef.current?.abort()
      const controller = new AbortController()
      abortControllerRef.current = controller

      if (reset) {
        setIsLoading(true)
      } else {
        setIsLoadingMore(true)
      }
      setError(null)

      let query = supabase
        .from('articles')
        .select(
          'id, title, status, created_at, updated_at, published_at, content, author_id, profiles(display_name)'
        )
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .limit(PAGE_SIZE)
        .abortSignal(controller.signal)

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

      const { data, error: fetchError } = await query

      if (fetchId !== abortRef.current) return

      if (fetchError) {
        // Ignore abort errors — they are expected when a new fetch supersedes the old one
        if (controller.signal.aborted) return
        setError(fetchError.message)
      } else {
        const rows: unknown[] = (data ?? []) as unknown[]
        const fetched = rows.map(parseArticle)
        setArticles((prev) => (reset ? fetched : [...prev, ...fetched]))
        setHasMore(fetched.length === PAGE_SIZE)
      }

      setIsLoading(false)
      setIsLoadingMore(false)
    },
    [search, status]
  )

  // Capture the initial reference. Its identity only changes when
  // search/status deps change, so this stays stable across Strict Mode remounts.
  const initialFetchRef = useRef(fetchArticles)

  // Skip the client-side fetch on the initial render when the server already
  // provided data. When filters change, fetchArticles identity changes and the
  // guard is bypassed, triggering a fresh fetch.
  useEffect(() => {
    if (hasInitial && fetchArticles === initialFetchRef.current) {
      return
    }
    setHasMore(true)
    fetchArticles(null, true)
  }, [fetchArticles])

  const fetchNextPage = useCallback(() => {
    if (!isLoadingMore && hasMore && articles.length > 0) {
      const last = articles[articles.length - 1]
      fetchArticles({ createdAt: last.created_at, id: last.id })
    }
  }, [fetchArticles, articles, isLoadingMore, hasMore])

  const retry = useCallback(() => {
    if (articles.length === 0) {
      fetchArticles(null, true)
    } else {
      const last = articles[articles.length - 1]
      fetchArticles({ createdAt: last.created_at, id: last.id })
    }
  }, [fetchArticles, articles])

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

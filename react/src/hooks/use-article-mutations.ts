'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  type Article,
  type ArticleFormData,
  parseArticle,
} from '@/lib/types/articles'

const supabase = createClient()

// Note: A single `isSubmitting` flag is shared across create, update, and delete
// operations. This means concurrent mutations are not supported — if one mutation
// is in flight, the UI should disable all mutation triggers. This is acceptable
// for the current modal-based UX where only one operation is active at a time.
interface MutationState {
  isSubmitting: boolean
  error: string | null
}

interface MutationResult<T> {
  data: T
  error: string | null
}

interface UseArticleMutationsReturn {
  createArticle: (
    data: ArticleFormData
  ) => Promise<MutationResult<Article | null>>
  updateArticle: (
    id: string,
    data: ArticleFormData
  ) => Promise<MutationResult<Article | null>>
  deleteArticle: (id: string) => Promise<MutationResult<boolean>>
  state: MutationState
}

export function useArticleMutations(): UseArticleMutationsReturn {
  const [state, setState] = useState<MutationState>({
    isSubmitting: false,
    error: null,
  })

  const createArticle = useCallback(
    async (data: ArticleFormData): Promise<MutationResult<Article | null>> => {
      setState({ isSubmitting: true, error: null })

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        const error = 'You must be signed in'
        setState({ isSubmitting: false, error })
        return { data: null, error }
      }

      const { data: article, error } = await supabase
        .from('articles')
        .insert({
          title: data.title.trim(),
          content: data.content || null,
          status: data.status,
          author_id: user.id,
        })
        .select(
          'id, title, status, created_at, updated_at, published_at, content, author_id, profiles(display_name)'
        )
        .single()

      if (error) {
        setState({ isSubmitting: false, error: error.message })
        return { data: null, error: error.message }
      }

      setState({ isSubmitting: false, error: null })
      // Cast to `unknown` so narrowing happens inside parseArticle rather than
      // relying on the Supabase SDK's structural type silently satisfying
      // a Record parameter — see PR review discussion.
      return {
        data: parseArticle(article as unknown),
        error: null,
      }
    },
    []
  )

  const updateArticle = useCallback(
    async (
      id: string,
      data: ArticleFormData
    ): Promise<MutationResult<Article | null>> => {
      setState({ isSubmitting: true, error: null })

      const { data: article, error } = await supabase
        .from('articles')
        .update({
          title: data.title.trim(),
          content: data.content || null,
          status: data.status,
        })
        .eq('id', id)
        .select(
          'id, title, status, created_at, updated_at, published_at, content, author_id, profiles(display_name)'
        )
        .single()

      if (error) {
        setState({ isSubmitting: false, error: error.message })
        return { data: null, error: error.message }
      }

      setState({ isSubmitting: false, error: null })
      return {
        data: parseArticle(article as unknown),
        error: null,
      }
    },
    []
  )

  const deleteArticle = useCallback(
    async (id: string): Promise<MutationResult<boolean>> => {
      setState({ isSubmitting: true, error: null })

      const { error } = await supabase.from('articles').delete().eq('id', id)

      if (error) {
        setState({ isSubmitting: false, error: error.message })
        return { data: false, error: error.message }
      }

      setState({ isSubmitting: false, error: null })
      return { data: true, error: null }
    },
    []
  )

  return { createArticle, updateArticle, deleteArticle, state }
}

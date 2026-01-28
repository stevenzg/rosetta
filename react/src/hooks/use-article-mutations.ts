'use client'

import { useCallback, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Article, ArticleFormData } from '@/lib/types/articles'

interface MutationState {
  isSubmitting: boolean
  error: string | null
}

interface UseArticleMutationsReturn {
  createArticle: (data: ArticleFormData) => Promise<Article | null>
  updateArticle: (id: string, data: ArticleFormData) => Promise<Article | null>
  deleteArticle: (id: string) => Promise<boolean>
  state: MutationState
}

export function useArticleMutations(): UseArticleMutationsReturn {
  const [state, setState] = useState<MutationState>({
    isSubmitting: false,
    error: null,
  })
  const supabase = createClient()

  const createArticle = useCallback(
    async (data: ArticleFormData): Promise<Article | null> => {
      setState({ isSubmitting: true, error: null })

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setState({ isSubmitting: false, error: 'You must be signed in' })
        return null
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
        return null
      }

      setState({ isSubmitting: false, error: null })
      return article as unknown as Article
    },
    [supabase]
  )

  const updateArticle = useCallback(
    async (id: string, data: ArticleFormData): Promise<Article | null> => {
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
        return null
      }

      setState({ isSubmitting: false, error: null })
      return article as unknown as Article
    },
    [supabase]
  )

  const deleteArticle = useCallback(
    async (id: string): Promise<boolean> => {
      setState({ isSubmitting: true, error: null })

      const { error } = await supabase.from('articles').delete().eq('id', id)

      if (error) {
        setState({ isSubmitting: false, error: error.message })
        return false
      }

      setState({ isSubmitting: false, error: null })
      return true
    },
    [supabase]
  )

  return { createArticle, updateArticle, deleteArticle, state }
}

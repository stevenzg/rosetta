import { describe, it, expect, vi, beforeEach } from 'vitest'

const { mockSingle, mockDeleteEq, mockFrom, mockGetUser } = vi.hoisted(() => {
  const mockSingle = vi.fn()
  const mockSelect = vi.fn(() => ({ single: mockSingle }))
  const mockInsert = vi.fn(() => ({ select: mockSelect }))
  const mockUpdateEq = vi.fn(() => ({ select: mockSelect }))
  const mockUpdate = vi.fn(() => ({ eq: mockUpdateEq }))
  const mockDeleteEq = vi.fn()
  const mockDelete = vi.fn(() => ({ eq: mockDeleteEq }))
  const mockFrom = vi.fn(() => ({
    insert: mockInsert,
    update: mockUpdate,
    delete: mockDelete,
  }))
  const mockGetUser = vi.fn()
  return {
    mockSingle,
    mockDeleteEq,
    mockFrom,
    mockGetUser,
  }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: { getUser: mockGetUser },
  }),
}))

import { renderHook, act } from '@testing-library/react'
import { useArticleMutations } from '../use-article-mutations'

const mockArticle = {
  id: '1',
  title: 'Test',
  content: null,
  status: 'draft',
  author_id: 'user-1',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  published_at: null,
  profiles: { display_name: 'User' },
}

describe('useArticleMutations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUser.mockResolvedValue({ data: { user: { id: 'user-1' } } })
  })

  describe('createArticle', () => {
    it('creates an article and returns it', async () => {
      mockSingle.mockResolvedValue({ data: mockArticle, error: null })

      const { result } = renderHook(() => useArticleMutations())

      let mutationResult: Awaited<
        ReturnType<typeof result.current.createArticle>
      >
      await act(async () => {
        mutationResult = await result.current.createArticle({
          title: 'Test',
          content: null,
          status: 'draft',
        })
      })

      expect(mutationResult!.data).toBeTruthy()
      expect(mutationResult!.error).toBeNull()
      expect(result.current.state.isSubmitting).toBe(false)
    })

    it('returns error when user is not signed in', async () => {
      mockGetUser.mockResolvedValue({ data: { user: null } })

      const { result } = renderHook(() => useArticleMutations())

      let mutationResult: Awaited<
        ReturnType<typeof result.current.createArticle>
      >
      await act(async () => {
        mutationResult = await result.current.createArticle({
          title: 'Test',
          content: null,
          status: 'draft',
        })
      })

      expect(mutationResult!.data).toBeNull()
      expect(mutationResult!.error).toBe('You must be signed in')
    })

    it('returns error on Supabase failure', async () => {
      mockSingle.mockResolvedValue({
        data: null,
        error: { message: 'Insert failed' },
      })

      const { result } = renderHook(() => useArticleMutations())

      let mutationResult: Awaited<
        ReturnType<typeof result.current.createArticle>
      >
      await act(async () => {
        mutationResult = await result.current.createArticle({
          title: 'Test',
          content: null,
          status: 'draft',
        })
      })

      expect(mutationResult!.error).toBe('Insert failed')
      expect(result.current.state.isSubmitting).toBe(false)
    })
  })

  describe('updateArticle', () => {
    it('updates an article and returns it', async () => {
      mockSingle.mockResolvedValue({
        data: { ...mockArticle, title: 'Updated' },
        error: null,
      })

      const { result } = renderHook(() => useArticleMutations())

      let mutationResult: Awaited<
        ReturnType<typeof result.current.updateArticle>
      >
      await act(async () => {
        mutationResult = await result.current.updateArticle('1', {
          title: 'Updated',
          content: null,
          status: 'draft',
        })
      })

      expect(mutationResult!.data).toBeTruthy()
      expect(mutationResult!.error).toBeNull()
    })
  })

  describe('deleteArticle', () => {
    it('deletes an article successfully', async () => {
      mockDeleteEq.mockResolvedValue({ error: null })

      const { result } = renderHook(() => useArticleMutations())

      let mutationResult: Awaited<
        ReturnType<typeof result.current.deleteArticle>
      >
      await act(async () => {
        mutationResult = await result.current.deleteArticle('1')
      })

      expect(mutationResult!.data).toBe(true)
      expect(mutationResult!.error).toBeNull()
    })

    it('returns error on delete failure', async () => {
      mockDeleteEq.mockResolvedValue({ error: { message: 'Delete failed' } })

      const { result } = renderHook(() => useArticleMutations())

      let mutationResult: Awaited<
        ReturnType<typeof result.current.deleteArticle>
      >
      await act(async () => {
        mutationResult = await result.current.deleteArticle('1')
      })

      expect(mutationResult!.data).toBe(false)
      expect(mutationResult!.error).toBe('Delete failed')
    })
  })
})

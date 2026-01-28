import { describe, it, expect, vi, beforeEach } from 'vitest'

const {
  mockGetUser,
  mockOnAuthStateChange,
  mockSignOut,
  mockSingle,
  mockFrom,
} = vi.hoisted(() => {
  const mockGetUser = vi.fn()
  const mockOnAuthStateChange = vi.fn()
  const mockSignOut = vi.fn()
  const mockSingle = vi.fn()
  const mockEq = vi.fn(() => ({ single: mockSingle }))
  const mockSelect = vi.fn(() => ({ eq: mockEq }))
  const mockFrom = vi.fn(() => ({ select: mockSelect }))
  return {
    mockGetUser,
    mockOnAuthStateChange,
    mockSignOut,
    mockSingle,
    mockFrom,
  }
})

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: {
      getUser: mockGetUser,
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}))

import { renderHook, waitFor, act } from '@testing-library/react'
import { useUser } from '../use-user'

describe('useUser', () => {
  const unsubscribe = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe } },
    })
  })

  it('returns viewer role when no user is signed in', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.role).toBe('viewer')
    expect(result.current.isEditor).toBe(false)
  })

  it('returns user profile and editor role for editors', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    })
    mockSingle.mockResolvedValue({
      data: { id: 'user-1', display_name: 'Editor User', role: 'editor' },
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual({ id: 'user-1' })
    expect(result.current.profile?.display_name).toBe('Editor User')
    expect(result.current.role).toBe('editor')
    expect(result.current.isEditor).toBe(true)
  })

  it('returns viewer role for viewer users', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-2' } },
    })
    mockSingle.mockResolvedValue({
      data: { id: 'user-2', display_name: 'Viewer User', role: 'viewer' },
    })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.isEditor).toBe(false)
  })

  it('clears user state on signOut', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: 'user-1' } },
    })
    mockSingle.mockResolvedValue({
      data: { id: 'user-1', display_name: 'User', role: 'editor' },
    })
    mockSignOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useUser())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('unsubscribes from auth changes on unmount', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { unmount } = renderHook(() => useUser())

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled()
    })

    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})

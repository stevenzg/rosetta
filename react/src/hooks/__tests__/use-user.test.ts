import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import React from 'react'

const { mockOnAuthStateChange, mockSignOut, mockSingle, mockFrom } = vi.hoisted(
  () => {
    const mockOnAuthStateChange = vi.fn()
    const mockSignOut = vi.fn()
    const mockSingle = vi.fn()
    const mockEq = vi.fn(() => ({ single: mockSingle }))
    const mockSelect = vi.fn(() => ({ eq: mockEq }))
    const mockFrom = vi.fn(() => ({ select: mockSelect }))
    return {
      mockOnAuthStateChange,
      mockSignOut,
      mockSingle,
      mockFrom,
    }
  }
)

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: mockFrom,
    auth: {
      onAuthStateChange: mockOnAuthStateChange,
      signOut: mockSignOut,
    },
  }),
}))

beforeAll(async () => {
  await import('@/lib/supabase/client')
})

import { renderHook, waitFor, act } from '@testing-library/react'
import { useUser, UserProvider } from '../use-user'

function createWrapper() {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(UserProvider, null, children)
  }
}

describe('useUser', () => {
  const unsubscribe = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    // By default, simulate INITIAL_SESSION with no user
    mockOnAuthStateChange.mockImplementation(
      (cb: (event: string, session: unknown) => void) => {
        cb('INITIAL_SESSION', null)
        return { data: { subscription: { unsubscribe } } }
      }
    )
  })

  it('returns viewer role when no user is signed in', async () => {
    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.role).toBe('viewer')
    expect(result.current.isEditor).toBe(false)
  })

  it('returns user profile and editor role for editors', async () => {
    mockOnAuthStateChange.mockImplementation(
      (cb: (event: string, session: unknown) => void) => {
        cb('INITIAL_SESSION', { user: { id: 'user-1' } })
        return { data: { subscription: { unsubscribe } } }
      }
    )
    mockSingle.mockResolvedValue({
      data: { id: 'user-1', display_name: 'Editor User', role: 'editor' },
    })

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.profile).not.toBeNull()
    })

    expect(result.current.user).toEqual({ id: 'user-1' })
    expect(result.current.profile?.display_name).toBe('Editor User')
    expect(result.current.role).toBe('editor')
    expect(result.current.isEditor).toBe(true)
  })

  it('returns viewer role for viewer users', async () => {
    mockOnAuthStateChange.mockImplementation(
      (cb: (event: string, session: unknown) => void) => {
        cb('INITIAL_SESSION', { user: { id: 'user-2' } })
        return { data: { subscription: { unsubscribe } } }
      }
    )
    mockSingle.mockResolvedValue({
      data: { id: 'user-2', display_name: 'Viewer User', role: 'viewer' },
    })

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.profile).not.toBeNull()
    })

    expect(result.current.isEditor).toBe(false)
    expect(result.current.role).toBe('viewer')
  })

  it('clears user state on signOut', async () => {
    mockOnAuthStateChange.mockImplementation(
      (cb: (event: string, session: unknown) => void) => {
        cb('INITIAL_SESSION', { user: { id: 'user-1' } })
        return { data: { subscription: { unsubscribe } } }
      }
    )
    mockSingle.mockResolvedValue({
      data: { id: 'user-1', display_name: 'User', role: 'editor' },
    })
    mockSignOut.mockResolvedValue({ error: null })

    const { result } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(result.current.profile).not.toBeNull()
    })

    await act(async () => {
      await result.current.signOut()
    })

    expect(result.current.user).toBeNull()
    expect(result.current.profile).toBeNull()
  })

  it('unsubscribes from auth changes on unmount', async () => {
    const { unmount } = renderHook(() => useUser(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => {
      expect(mockOnAuthStateChange).toHaveBeenCalled()
    })

    unmount()
    expect(unsubscribe).toHaveBeenCalled()
  })
})

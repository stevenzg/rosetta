'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  parseProfile,
  type UserProfile,
  type UserRole,
} from '@/lib/types/articles'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

interface UserContextValue {
  user: User | null
  profile: UserProfile | null
  role: UserRole
  isEditor: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const profileFetchIdRef = useRef(0)

  // Fetch profile outside of auth callbacks to avoid deadlocking
  // with Supabase's internal initializePromise.
  useEffect(() => {
    let cancelled = false
    const id = ++profileFetchIdRef.current

    if (!user) {
      setProfile(null)
      return
    }

    ;(async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, role')
          .eq('id', user.id)
          .single()
        if (!cancelled && id === profileFetchIdRef.current && data) {
          setProfile(parseProfile(data))
        }
      } catch {
        // profile fetch failed — leave as null
      }
    })()

    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    let ignore = false

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Synchronous — no Supabase data queries here to avoid
      // deadlocking with auth initialization.
      if (ignore) return

      setUser(session?.user ?? null)

      if (event === 'INITIAL_SESSION') {
        setIsLoading(false)
      }
    })

    return () => {
      ignore = true
      subscription.unsubscribe()
    }
  }, [])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [])

  const role: UserRole = profile?.role ?? 'viewer'

  const value: UserContextValue = {
    user,
    profile,
    role,
    isEditor: role === 'editor',
    isLoading,
    signOut,
  }

  return <UserContext value={value}>{children}</UserContext>
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUser must be used within a <UserProvider>')
  }
  return ctx
}

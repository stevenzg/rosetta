'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  parseProfile,
  type UserProfile,
  type UserRole,
} from '@/lib/types/articles'
import type { User } from '@supabase/supabase-js'

const supabase = createClient()

interface UseUserReturn {
  user: User | null
  profile: UserProfile | null
  role: UserRole
  isEditor: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data } = await supabase
    .from('profiles')
    .select('id, display_name, role')
    .eq('id', userId)
    .single()
  if (!data) return null
  return parseProfile(data)
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let ignore = false

    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()

      if (ignore) return
      setUser(currentUser)

      if (currentUser) {
        const profileData = await fetchProfile(currentUser.id)
        if (!ignore) setProfile(profileData)
      }
      if (!ignore) setIsLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Skip INITIAL_SESSION since loadUser() already handles the initial fetch
      if (event === 'INITIAL_SESSION') return

      // Guard the entire callback with the `ignore` flag to prevent state
      // updates after the component has unmounted (i.e. after cleanup runs).
      if (ignore) return

      setUser(session?.user ?? null)
      if (session?.user) {
        const profileData = await fetchProfile(session.user.id)
        if (!ignore) setProfile(profileData)
      } else {
        setProfile(null)
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

  return {
    user,
    profile,
    role,
    isEditor: role === 'editor',
    isLoading,
    signOut,
  }
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { UserProfile, UserRole } from '@/lib/types/articles'
import type { User } from '@supabase/supabase-js'

interface UseUserReturn {
  user: User | null
  profile: UserProfile | null
  role: UserRole
  isEditor: boolean
  isLoading: boolean
  signOut: () => Promise<void>
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user: currentUser },
      } = await supabase.auth.getUser()
      setUser(currentUser)

      if (currentUser) {
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, role')
          .eq('id', currentUser.id)
          .single()
        if (data) {
          setProfile(data as UserProfile)
        }
      }
      setIsLoading(false)
    }

    loadUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, display_name, role')
          .eq('id', session.user.id)
          .single()
        if (data) {
          setProfile(data as UserProfile)
        }
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }, [supabase])

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

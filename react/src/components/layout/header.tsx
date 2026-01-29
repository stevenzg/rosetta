'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LogIn, LogOut, User, UserPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme/theme-toggle'
import { useUser } from '@/hooks/use-user'
import { AuthDialog } from '@/components/auth/auth-dialog'

type AuthMode = 'login' | 'register'

export function Header() {
  const { user, profile, signOut, isLoading } = useUser()
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode)
    setAuthOpen(true)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav
        className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4"
        aria-label="Main navigation"
      >
        <Link href="/articles" className="text-lg font-semibold tracking-tight">
          Rosetta
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          {isLoading ? (
            <>
              <div className="h-9 w-9" />
              <div className="h-9 w-9" />
            </>
          ) : user ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1 text-sm text-muted-foreground sm:flex">
                <User className="h-4 w-4" aria-hidden="true" />
                {profile?.display_name ?? user.email}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={signOut}
                aria-label="Sign out"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign up"
                onClick={() => openAuth('register')}
              >
                <UserPlus className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign in"
                onClick={() => openAuth('login')}
              >
                <LogIn className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>
      </nav>

      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        defaultMode={authMode}
      />
    </header>
  )
}

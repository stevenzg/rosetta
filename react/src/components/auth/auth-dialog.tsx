'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

let _supabase: ReturnType<
  Awaited<typeof import('@/lib/supabase/client')>['createClient']
> | null = null

async function getSupabase() {
  if (!_supabase) {
    const { createClient } = await import('@/lib/supabase/client')
    _supabase = createClient()
  }
  return _supabase
}

type AuthMode = 'login' | 'register'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  defaultMode?: AuthMode
}

export function AuthDialog({
  open,
  onOpenChange,
  defaultMode = 'login',
}: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode)

  useEffect(() => {
    if (open) {
      setMode(defaultMode)
      reset()
    }
  }, [open, defaultMode])
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const reset = () => {
    setEmail('')
    setPassword('')
    setConfirmPassword('')
    setError(null)
    setSuccess(false)
    setIsLoading(false)
  }

  const switchMode = (next: AuthMode) => {
    reset()
    setMode(next)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) reset()
    onOpenChange(nextOpen)
  }

  const isValidEmail = (value: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

  const validateBase = (trimmedEmail: string): string | null => {
    if (!trimmedEmail || !password)
      return 'Please enter both email and password.'
    if (!isValidEmail(trimmedEmail))
      return 'Please enter a valid email address.'
    return null
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    const validationError = validateBase(trimmedEmail)
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    const supabase = await getSupabase()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    handleOpenChange(false)
    router.refresh()
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    if (!isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setIsLoading(true)

    const supabase = await getSupabase()
    const { error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
    })

    if (authError) {
      setError(authError.message)
      setIsLoading(false)
      return
    }

    setSuccess(true)
    setIsLoading(false)
  }

  const isLogin = mode === 'login'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{isLogin ? 'Sign In' : 'Sign Up'}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? 'Enter your credentials to access the dashboard'
              : 'Create an account to get started'}
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              Check your email for a confirmation link to complete your
              registration.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => switchMode('login')}
            >
              Back to Sign In
            </Button>
          </div>
        ) : (
          <>
            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-2">
                <Label htmlFor="auth-email">Email</Label>
                <Input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="auth-password">Password</Label>
                <Input
                  id="auth-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    isLogin ? 'Your password' : 'At least 6 characters'
                  }
                  required
                  autoComplete={isLogin ? 'current-password' : 'new-password'}
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="auth-confirm-password">
                    Confirm Password
                  </Label>
                  <Input
                    id="auth-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat your password"
                    required
                    autoComplete="new-password"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading
                  ? isLogin
                    ? 'Signing in...'
                    : 'Creating account...'
                  : isLogin
                    ? 'Sign In'
                    : 'Sign Up'}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground">
              {isLogin ? (
                <>
                  Don&apos;t have an account?{' '}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => switchMode('register')}
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="font-medium text-primary underline-offset-4 hover:underline"
                    onClick={() => switchMode('login')}
                  >
                    Sign In
                  </button>
                </>
              )}
            </p>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AuthDialog } from '../auth-dialog'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

// Mock Supabase client — return a controllable auth object
const mockSignIn = vi.fn()
const mockSignUp = vi.fn()

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignIn,
      signUp: mockSignUp,
    },
  }),
}))

describe('AuthDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockSignIn.mockResolvedValue({ error: null })
    mockSignUp.mockResolvedValue({ error: null })
  })

  it('renders login form by default', () => {
    render(<AuthDialog {...defaultProps} />)

    expect(screen.getByRole('heading', { name: 'Sign In' })).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument()
    // Confirm password should NOT be shown in login mode
    expect(screen.queryByLabelText(/confirm password/i)).not.toBeInTheDocument()
  })

  it('switches to register mode and shows confirm password field', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: /sign up/i }))

    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
  })

  it('shows error when submitting login with empty fields', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please enter both email and password.'
    )
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('shows error for invalid email format on login', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    await user.type(screen.getByLabelText(/email/i), 'not-an-email')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Please enter a valid email address.'
    )
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it('shows error when register passwords do not match', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} defaultMode="register" />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password1')
    await user.type(screen.getByLabelText(/confirm password/i), 'password2')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Passwords do not match.'
    )
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows error when register password is too short', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} defaultMode="register" />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), '12345')
    await user.type(screen.getByLabelText(/confirm password/i), '12345')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Password must be at least 6 characters.'
    )
    expect(mockSignUp).not.toHaveBeenCalled()
  })

  it('shows success message after successful registration', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} defaultMode="register" />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: 'Sign Up' }))

    expect(await screen.findByText(/check your email/i)).toBeInTheDocument()
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('displays auth error from Supabase on login failure', async () => {
    mockSignIn.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    await user.type(screen.getByLabelText(/email/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^password$/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'Sign In' }))

    expect(
      await screen.findByText('Invalid login credentials')
    ).toBeInTheDocument()
  })

  it('resets form state when switching between login and register', async () => {
    const user = userEvent.setup()
    render(<AuthDialog {...defaultProps} />)

    // Type in login form
    await user.type(screen.getByLabelText(/email/i), 'test@example.com')

    // Switch to register
    await user.click(screen.getByRole('button', { name: /sign up/i }))

    // Email field should be cleared
    expect(screen.getByLabelText(/email/i)).toHaveValue('')
  })
})

import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { ArticleFilters } from '../article-filters'

describe('ArticleFilters', () => {
  const defaultProps = {
    currentSearch: '',
    currentStatus: 'all',
    onSearchChange: vi.fn(),
    onStatusChange: vi.fn(),
  }

  it('renders search input and all status filter buttons', () => {
    render(<ArticleFilters {...defaultProps} />)

    expect(
      screen.getByRole('searchbox', { name: /search articles/i })
    ).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'All' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Published' })).toBeInTheDocument()
    expect(screen.getByRole('radio', { name: 'Draft' })).toBeInTheDocument()
  })

  it('debounces search input before calling onSearchChange', async () => {
    const onSearchChange = vi.fn()
    const user = userEvent.setup()
    render(<ArticleFilters {...defaultProps} onSearchChange={onSearchChange} />)

    const input = screen.getByRole('searchbox', { name: /search articles/i })
    await user.type(input, 'hello')

    // Immediately after typing, the debounced callback should not have fired
    expect(onSearchChange).not.toHaveBeenCalled()

    // After the debounce delay, the callback fires with the final value
    await waitFor(() => {
      expect(onSearchChange).toHaveBeenCalledWith('hello')
    })
    expect(onSearchChange).toHaveBeenCalledTimes(1)
  })

  it('calls onStatusChange immediately when a status button is clicked', async () => {
    const onStatusChange = vi.fn()
    const user = userEvent.setup()
    render(<ArticleFilters {...defaultProps} onStatusChange={onStatusChange} />)

    await user.click(screen.getByRole('radio', { name: 'Published' }))

    expect(onStatusChange).toHaveBeenCalledWith('published')
  })

  it('marks the current status button as checked', () => {
    render(<ArticleFilters {...defaultProps} currentStatus="draft" />)

    expect(screen.getByRole('radio', { name: 'Draft' })).toHaveAttribute(
      'aria-checked',
      'true'
    )
    expect(screen.getByRole('radio', { name: 'All' })).toHaveAttribute(
      'aria-checked',
      'false'
    )
  })

  it('syncs input value when currentSearch prop changes externally', () => {
    const { rerender } = render(
      <ArticleFilters {...defaultProps} currentSearch="old" />
    )

    const input = screen.getByRole('searchbox', {
      name: /search articles/i,
    }) as HTMLInputElement
    expect(input.value).toBe('old')

    rerender(<ArticleFilters {...defaultProps} currentSearch="new" />)
    expect(input.value).toBe('new')
  })
})

'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { DEBOUNCE_MS, STATUS_OPTIONS } from '@/lib/constants'

interface ArticleFiltersProps {
  currentSearch: string
  currentStatus: string
  onSearchChange: (search: string) => void
  onStatusChange: (status: string) => void
}

export function ArticleFilters({
  currentSearch,
  currentStatus,
  onSearchChange,
  onStatusChange,
}: ArticleFiltersProps) {
  const [inputValue, setInputValue] = useState(currentSearch)
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    // Clear any pending debounce timer to prevent stale callbacks from firing
    // after the search value is reset externally.
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setInputValue(currentSearch)
  }, [currentSearch])

  const handleInputChange = useCallback(
    (value: string) => {
      setInputValue(value)
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        onSearchChange(value)
      }, DEBOUNCE_MS)
    },
    [onSearchChange]
  )

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-xs">
        <Search
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Search articles by title..."
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          className="pl-9"
          aria-label="Search articles by title"
        />
      </div>

      <div
        role="radiogroup"
        aria-label="Filter articles by status"
        className="flex h-9 items-center gap-0.5 rounded-lg bg-muted p-[3px] sm:inline-flex"
      >
        {STATUS_OPTIONS.map((opt) => (
          <Button
            key={opt.value}
            variant="ghost"
            size="sm"
            role="radio"
            aria-checked={currentStatus === opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`h-full flex-1 rounded-md px-3 text-sm font-medium sm:flex-initial ${
              currentStatus === opt.value
                ? 'bg-background text-foreground shadow-sm'
                : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

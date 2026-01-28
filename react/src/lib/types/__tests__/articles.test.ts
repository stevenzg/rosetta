import { describe, expect, it } from 'vitest'
import { parseArticle, parseProfile } from '../articles'

const validRow = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Test Article',
  content: 'Some content',
  status: 'draft' as const,
  author_id: 'user-1',
  created_at: '2025-01-01T00:00:00Z',
  updated_at: '2025-01-01T00:00:00Z',
  published_at: null,
  profiles: { display_name: 'Alice' },
}

describe('parseArticle', () => {
  it('parses a valid article row', () => {
    const result = parseArticle(validRow)
    expect(result).toEqual(validRow)
  })

  it('accepts published status', () => {
    const result = parseArticle({ ...validRow, status: 'published' })
    expect(result.status).toBe('published')
  })

  it('accepts null content', () => {
    const result = parseArticle({ ...validRow, content: null })
    expect(result.content).toBeNull()
  })

  it('accepts undefined content (coerces to null)', () => {
    const row = { ...validRow }
    delete (row as Record<string, unknown>).content
    const result = parseArticle(row)
    expect(result.content).toBeNull()
  })

  it('accepts null profiles', () => {
    const result = parseArticle({ ...validRow, profiles: null })
    expect(result.profiles).toBeNull()
  })

  it('accepts null published_at', () => {
    const result = parseArticle({ ...validRow, published_at: null })
    expect(result.published_at).toBeNull()
  })

  it('accepts string published_at', () => {
    const result = parseArticle({
      ...validRow,
      published_at: '2025-06-01T00:00:00Z',
    })
    expect(result.published_at).toBe('2025-06-01T00:00:00Z')
  })

  it('throws for non-object input', () => {
    expect(() => parseArticle(null)).toThrow('expected an object')
    expect(() => parseArticle(undefined)).toThrow('expected an object')
    expect(() => parseArticle('string')).toThrow('expected an object')
    expect(() => parseArticle(42)).toThrow('expected an object')
  })

  it('throws for missing id', () => {
    const row = { ...validRow, id: undefined }
    expect(() => parseArticle(row)).toThrow('expected id to be string')
  })

  it('throws for non-string id', () => {
    const row = { ...validRow, id: 123 }
    expect(() => parseArticle(row)).toThrow('expected id to be string')
  })

  it('throws for missing title', () => {
    const row = { ...validRow, title: undefined }
    expect(() => parseArticle(row)).toThrow('expected title to be string')
  })

  it('throws for invalid status', () => {
    const row = { ...validRow, status: 'archived' }
    expect(() => parseArticle(row)).toThrow(
      "expected status to be 'draft' | 'published'"
    )
  })

  it('throws for missing status', () => {
    const row = { ...validRow, status: undefined }
    expect(() => parseArticle(row)).toThrow(
      "expected status to be 'draft' | 'published'"
    )
  })

  it('throws for non-string author_id', () => {
    const row = { ...validRow, author_id: 99 }
    expect(() => parseArticle(row)).toThrow('expected author_id to be string')
  })

  it('throws for non-string created_at', () => {
    const row = { ...validRow, created_at: 123 }
    expect(() => parseArticle(row)).toThrow('expected created_at to be string')
  })

  it('throws for non-string updated_at', () => {
    const row = { ...validRow, updated_at: true }
    expect(() => parseArticle(row)).toThrow('expected updated_at to be string')
  })

  it('throws for non-string/non-null published_at', () => {
    const row = { ...validRow, published_at: 42 }
    expect(() => parseArticle(row)).toThrow(
      'expected published_at to be string | null'
    )
  })

  it('throws for non-string content', () => {
    const row = { ...validRow, content: 42 }
    expect(() => parseArticle(row)).toThrow(
      'expected content to be string | null'
    )
  })

  it('throws for malformed profiles object (missing display_name)', () => {
    const row = { ...validRow, profiles: { name: 'Alice' } }
    expect(() => parseArticle(row)).toThrow(
      'expected profiles.display_name to be string'
    )
  })

  it('throws for non-object profiles', () => {
    const row = { ...validRow, profiles: 'invalid' }
    expect(() => parseArticle(row)).toThrow('expected profiles to be an object')
  })
})

describe('parseProfile', () => {
  const validProfile = {
    id: 'user-1',
    display_name: 'Alice',
    role: 'editor' as const,
  }

  it('parses a valid profile', () => {
    const result = parseProfile(validProfile)
    expect(result).toEqual(validProfile)
  })

  it('accepts viewer role', () => {
    const result = parseProfile({ ...validProfile, role: 'viewer' })
    expect(result.role).toBe('viewer')
  })

  it('throws for non-object input', () => {
    expect(() => parseProfile(null)).toThrow('expected an object')
    expect(() => parseProfile(undefined)).toThrow('expected an object')
    expect(() => parseProfile('string')).toThrow('expected an object')
  })

  it('throws for missing id', () => {
    expect(() => parseProfile({ ...validProfile, id: undefined })).toThrow(
      'expected id to be string'
    )
  })

  it('throws for missing display_name', () => {
    expect(() =>
      parseProfile({ ...validProfile, display_name: undefined })
    ).toThrow('expected display_name to be string')
  })

  it('throws for invalid role', () => {
    expect(() => parseProfile({ ...validProfile, role: 'admin' })).toThrow(
      "expected role to be 'viewer' | 'editor'"
    )
  })

  it('throws for missing role', () => {
    expect(() => parseProfile({ ...validProfile, role: undefined })).toThrow(
      "expected role to be 'viewer' | 'editor'"
    )
  })
})

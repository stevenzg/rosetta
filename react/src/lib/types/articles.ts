export type ArticleStatus = 'draft' | 'published'

export interface Article {
  id: string
  title: string
  content: string | null
  status: ArticleStatus
  author_id: string
  created_at: string
  updated_at: string
  published_at: string | null
  profiles: { display_name: string } | null
}

/**
 * Runtime validation for raw Supabase article rows with joined `profiles`.
 *
 * This replaces unsafe `as unknown as Article[]` casts by validating every
 * field at runtime so that schema mismatches surface as explicit errors
 * rather than silent type lies.  When Supabase generated types are adopted
 * (`supabase gen types typescript`) this function can be removed.
 */
 
export function parseArticle(row: Record<string, any>): Article {
  if (typeof row.id !== 'string') {
    throw new Error(
      `Article validation failed: expected id to be string, got ${typeof row.id}. Row: ${JSON.stringify(row)}`
    )
  }
  if (typeof row.title !== 'string') {
    throw new Error(
      `Article validation failed: expected title to be string, got ${typeof row.title}. Row: ${JSON.stringify(row)}`
    )
  }
  if (row.status !== 'draft' && row.status !== 'published') {
    throw new Error(
      `Article validation failed: expected status to be 'draft' | 'published', got '${String(row.status)}'. Row: ${JSON.stringify(row)}`
    )
  }
  if (typeof row.author_id !== 'string') {
    throw new Error(
      `Article validation failed: expected author_id to be string, got ${typeof row.author_id}. Row: ${JSON.stringify(row)}`
    )
  }
  if (typeof row.created_at !== 'string') {
    throw new Error(
      `Article validation failed: expected created_at to be string, got ${typeof row.created_at}. Row: ${JSON.stringify(row)}`
    )
  }
  if (typeof row.updated_at !== 'string') {
    throw new Error(
      `Article validation failed: expected updated_at to be string, got ${typeof row.updated_at}. Row: ${JSON.stringify(row)}`
    )
  }
  if (row.published_at !== null && typeof row.published_at !== 'string') {
    throw new Error(
      `Article validation failed: expected published_at to be string | null, got ${typeof row.published_at}. Row: ${JSON.stringify(row)}`
    )
  }
  if (
    row.content !== null &&
    row.content !== undefined &&
    typeof row.content !== 'string'
  ) {
    throw new Error(
      `Article validation failed: expected content to be string | null, got ${typeof row.content}. Row: ${JSON.stringify(row)}`
    )
  }

  let profiles: { display_name: string } | null = null
  if (row.profiles != null) {
    const p = row.profiles as Record<string, unknown>
    if (typeof p.display_name !== 'string') {
      throw new Error(
        `Article validation failed: expected profiles.display_name to be string, got ${typeof p.display_name}. Row: ${JSON.stringify(row)}`
      )
    }
    profiles = { display_name: p.display_name }
  }

  return {
    id: row.id,
    title: row.title,
    content: (row.content as string) ?? null,
    status: row.status,
    author_id: row.author_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    published_at: (row.published_at as string) ?? null,
    profiles,
  }
}

export interface ArticleFormData {
  title: string
  content: string | null
  status: ArticleStatus
}

export type UserRole = 'viewer' | 'editor'

export interface UserProfile {
  id: string
  display_name: string
  role: UserRole
}

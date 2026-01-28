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
 * Validates and maps a raw Supabase row (with joined `profiles`) into an Article.
 * Throws in development if the shape is unexpected, so schema mismatches are
 * caught early instead of being silently masked by `as unknown as Article[]`.
 */
export function parseArticle(row: Record<string, unknown>): Article {
  const id = row.id
  const title = row.title
  const status = row.status

  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    (status !== 'draft' && status !== 'published')
  ) {
    throw new Error(
      `Unexpected article shape from Supabase: ${JSON.stringify(row)}`
    )
  }

  return {
    id,
    title,
    content: (row.content as string) ?? null,
    status,
    author_id: row.author_id as string,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    published_at: (row.published_at as string) ?? null,
    profiles:
      row.profiles != null
        ? {
            display_name: (row.profiles as { display_name: string })
              .display_name,
          }
        : null,
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

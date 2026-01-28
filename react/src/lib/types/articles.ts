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

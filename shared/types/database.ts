/**
 * Database types for the Article Management System
 * These types mirror the Supabase database schema
 */

// Article status enum matching PostgreSQL enum
export type ArticleStatus = 'draft' | 'published'

// Base article type matching the articles table schema
export interface Article {
  id: string // UUID
  title: string
  content: string | null
  status: ArticleStatus
  author_id: string // UUID referencing auth.users
  created_at: string // ISO 8601 timestamp
  updated_at: string // ISO 8601 timestamp
  published_at: string | null // ISO 8601 timestamp, null if never published
}

// Article with author information (for list displays)
export interface ArticleWithAuthor extends Article {
  author_name: string
  author_email: string
}

// Type for creating a new article
export interface ArticleInsert {
  title: string
  content?: string | null
  status?: ArticleStatus
  author_id: string
}

// Type for updating an existing article
export interface ArticleUpdate {
  title?: string
  content?: string | null
  status?: ArticleStatus
}

// Pagination parameters
export interface PaginationParams {
  page: number
  pageSize: number
}

// Generic paginated response
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Article filter options
export interface ArticleFilters {
  status?: ArticleStatus | null
  search?: string | null
}

// Combined query parameters for article listing
export interface ArticleQueryParams extends PaginationParams, ArticleFilters {}

// Article list item (optimized for list display with only necessary fields)
export interface ArticleListItem {
  id: string
  title: string
  status: ArticleStatus
  author_id: string
  author_name?: string
  created_at: string
}

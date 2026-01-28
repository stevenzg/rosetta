/**
 * Supabase database types
 * This file defines the database schema types for use with the Supabase client
 *
 * Note: In production, these types should be auto-generated using:
 * npx supabase gen types typescript --local > shared/types/supabase.ts
 */

import type { ArticleStatus } from './database'

export interface Database {
  public: {
    Tables: {
      articles: {
        Row: {
          id: string
          title: string
          content: string | null
          status: ArticleStatus
          author_id: string
          created_at: string
          updated_at: string
          published_at: string | null
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          status?: ArticleStatus
          author_id: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          status?: ArticleStatus
          author_id?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'articles_author_id_fkey'
            columns: ['author_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      article_status: ArticleStatus
    }
    CompositeTypes: Record<string, never>
  }
}

// Helper type to extract table row type
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

// Helper type to extract table insert type
export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

// Helper type to extract table update type
export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Helper type to extract enum type
export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]

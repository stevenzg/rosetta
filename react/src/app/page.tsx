import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PAGE_SIZE } from '@/lib/constants'
import { ArticleList } from '@/components/articles/article-list'
import { type Article, parseArticle } from '@/lib/types/articles'

export const metadata: Metadata = {
  title: 'Articles - Rosetta',
  description: 'Browse, search, and manage articles',
}

export default async function Home() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select(
      'id, title, status, created_at, updated_at, published_at, content, author_id, profiles(display_name)'
    )
    .order('created_at', { ascending: false })
    .order('id', { ascending: false })
    .limit(PAGE_SIZE)

  if (error) {
    console.error('Failed to fetch initial articles:', error.message)
  }

  const rows: unknown[] = (data ?? []) as unknown[]
  const initialArticles: Article[] = rows.map(parseArticle)

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <ArticleList initialArticles={initialArticles} />
    </main>
  )
}

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { PAGE_SIZE } from '@/lib/constants'
import { ArticleList } from '@/components/articles/article-list'
import type { Article } from '@/lib/types/articles'

export const metadata: Metadata = {
  title: 'Articles - Rosetta',
  description: 'Browse, search, and manage articles',
}

export default async function ArticlesPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('articles')
    .select(
      'id, title, status, created_at, updated_at, published_at, content, author_id, profiles(display_name)'
    )
    .order('created_at', { ascending: false })
    .range(0, PAGE_SIZE - 1)

  const initialArticles = (data ?? []) as unknown as Article[]

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <ArticleList initialArticles={initialArticles} />
    </main>
  )
}

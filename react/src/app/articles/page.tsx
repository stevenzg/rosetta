import type { Metadata } from 'next'
import { ArticleList } from '@/components/articles/article-list'

export const metadata: Metadata = {
  title: 'Articles - Rosetta',
  description: 'Browse, search, and manage articles',
}

export default function ArticlesPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <ArticleList />
    </main>
  )
}

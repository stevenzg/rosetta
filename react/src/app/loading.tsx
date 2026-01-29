import { Skeleton } from '@/components/ui/skeleton'
import { ArticleListSkeleton } from '@/components/articles/article-list-skeleton'

export default function Loading() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Articles</h1>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-9 w-full sm:max-w-xs" />
          <Skeleton className="h-9 w-full sm:w-[220px]" />
        </div>

        <ArticleListSkeleton count={8} />
      </div>
    </main>
  )
}

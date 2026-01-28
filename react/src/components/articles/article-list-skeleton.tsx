import { Skeleton } from '@/components/ui/skeleton'

export function ArticleListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div role="status" aria-label="Loading articles" className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      ))}
      <span className="sr-only">Loading articles, please wait...</span>
    </div>
  )
}

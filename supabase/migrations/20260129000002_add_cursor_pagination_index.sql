-- Support cursor-based pagination with (created_at, id) composite ordering.
-- The existing idx_articles_created_at only covers created_at DESC, which does
-- not help with the tiebreaker condition (created_at = ? AND id < ?).

CREATE INDEX idx_articles_created_at_id ON public.articles(created_at DESC, id DESC);

-- Also add a composite index for status-filtered cursor pagination.
CREATE INDEX idx_articles_status_created_id ON public.articles(status, created_at DESC, id DESC);

-- The old single-column and two-column indexes are now redundant:
DROP INDEX IF EXISTS idx_articles_created_at;
DROP INDEX IF EXISTS idx_articles_status_created;

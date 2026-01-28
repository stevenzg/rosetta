-- Migration: Create indexes for articles table
-- Description: Adds performance indexes for common query patterns

-- Index for filtering by author
CREATE INDEX idx_articles_author_id ON public.articles(author_id);

-- Index for filtering by status
CREATE INDEX idx_articles_status ON public.articles(status);

-- Index for default ordering by created date (descending for most recent first)
CREATE INDEX idx_articles_created_at ON public.articles(created_at DESC);

-- GIN index for full-text search on title
CREATE INDEX idx_articles_title_search ON public.articles USING gin(to_tsvector('english', title));

-- Composite index for filtered pagination (status + created_at)
-- Optimizes queries like: WHERE status = 'published' ORDER BY created_at DESC
CREATE INDEX idx_articles_status_created ON public.articles(status, created_at DESC);

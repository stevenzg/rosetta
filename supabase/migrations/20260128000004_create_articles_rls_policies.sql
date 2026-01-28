-- Migration: Create Row Level Security policies for articles
-- Description: Implements authorization rules at the database level

-- Enable Row Level Security on articles table
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

-- NOTE: PostgreSQL ORs together multiple SELECT policies for the same table.
-- This means a row is visible if ANY of the SELECT policies' USING clauses evaluate to true.
-- For example, an authenticated user viewing their own published article will match BOTH
-- the "Published articles are viewable by everyone" policy AND the "Users can view their own drafts" policy.
-- This is the intended behavior and works correctly.
-- Alternative approach: A single consolidated policy with combined conditions:
--   USING (status = 'published' OR auth.uid() = author_id)
-- We use separate policies here for clarity of intent and easier maintenance.

-- Policy: Anyone can view published articles (including anonymous users)
CREATE POLICY "Published articles are viewable by everyone"
    ON public.articles
    FOR SELECT
    USING (status = 'published');

-- Policy: Authenticated users can view their own articles (including drafts)
CREATE POLICY "Users can view their own drafts"
    ON public.articles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = author_id);

-- Policy: Authenticated users can create articles (author_id must match their user id)
CREATE POLICY "Authenticated users can create articles"
    ON public.articles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = author_id);

-- Policy: Users can only update their own articles
CREATE POLICY "Users can update their own articles"
    ON public.articles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- Policy: Users can only delete their own articles
CREATE POLICY "Users can delete their own articles"
    ON public.articles
    FOR DELETE
    TO authenticated
    USING (auth.uid() = author_id);

-- Migration: Create articles table
-- Description: Main table for storing article data with all required fields

-- Create articles table
CREATE TABLE public.articles (
    -- Primary Key (UUID for better distribution and security)
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Core Fields
    title           VARCHAR(255) NOT NULL,
    content         TEXT,
    status          article_status NOT NULL DEFAULT 'draft',

    -- Author Reference (links to Supabase auth.users)
    author_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

    -- Timestamps
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at    TIMESTAMPTZ,

    -- Constraints
    CONSTRAINT articles_title_not_empty CHECK (char_length(trim(title)) > 0)
);

-- Add table and column comments for documentation
COMMENT ON TABLE public.articles IS 'Stores all articles in the system with their metadata and content';
COMMENT ON COLUMN public.articles.id IS 'Unique identifier for the article (UUID v4)';
COMMENT ON COLUMN public.articles.title IS 'Article title, required field, max 255 characters';
COMMENT ON COLUMN public.articles.content IS 'Article body content in plain text or markdown';
COMMENT ON COLUMN public.articles.status IS 'Publication status: draft or published';
COMMENT ON COLUMN public.articles.author_id IS 'Reference to the user who created the article';
COMMENT ON COLUMN public.articles.created_at IS 'Timestamp when the article was created';
COMMENT ON COLUMN public.articles.updated_at IS 'Timestamp when the article was last updated';
COMMENT ON COLUMN public.articles.published_at IS 'Timestamp when the article was first published (null if never published)';

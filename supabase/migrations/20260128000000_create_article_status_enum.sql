-- Migration: Create article_status enum type
-- Description: Defines the valid status values for articles (draft, published)

-- Create enum type for article status
CREATE TYPE article_status AS ENUM ('draft', 'published');

-- Add comment for documentation
COMMENT ON TYPE article_status IS 'Valid status values for articles: draft (unpublished, work in progress) or published (live, visible to readers)';

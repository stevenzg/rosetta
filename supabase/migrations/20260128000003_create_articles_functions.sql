-- Migration: Create database functions for articles
-- Description: Trigger functions for automatic timestamp management

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_updated_at() IS 'Trigger function that automatically sets updated_at to current timestamp on row update';

-- Trigger for articles table to auto-update updated_at
CREATE TRIGGER set_articles_updated_at
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Function to automatically set published_at when status is or becomes published
-- Handles both INSERT (article created directly as published) and UPDATE (status changed to published)
CREATE OR REPLACE FUNCTION public.handle_article_publish()
RETURNS TRIGGER AS $$
BEGIN
    -- For INSERT: Set published_at if article is created with 'published' status
    -- For UPDATE: Set published_at only when transitioning to 'published' from another status
    IF TG_OP = 'INSERT' THEN
        IF NEW.status = 'published' AND NEW.published_at IS NULL THEN
            NEW.published_at = NOW();
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        IF NEW.status = 'published' AND OLD.status != 'published' AND NEW.published_at IS NULL THEN
            NEW.published_at = NOW();
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add comment for documentation
COMMENT ON FUNCTION public.handle_article_publish() IS 'Trigger function that automatically sets published_at when article status is or becomes published (handles both INSERT and UPDATE)';

-- Trigger for articles table to auto-set published_at on INSERT
CREATE TRIGGER set_articles_published_at_on_insert
    BEFORE INSERT ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_article_publish();

-- Trigger for articles table to auto-set published_at on UPDATE
CREATE TRIGGER set_articles_published_at_on_update
    BEFORE UPDATE ON public.articles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_article_publish();

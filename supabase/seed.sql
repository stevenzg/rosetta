-- Seed file for Article Management System
-- This file provides sample data for development and testing
--
-- Note: This seed file requires at least one user in auth.users
-- In local development, create a user first via Supabase Studio or auth API
--
-- To use with existing users, replace the author_id values with actual user UUIDs
-- You can find user UUIDs in the Supabase dashboard under Authentication > Users

-- Example seed data (commented out - requires valid author_id)
-- Uncomment and update author_id after creating a user

/*
-- Insert sample articles with a mix of statuses
INSERT INTO public.articles (title, content, status, author_id, published_at)
VALUES
    (
        'Getting Started with Supabase',
        'Supabase is an open source Firebase alternative. This guide will help you get started with building your first application.',
        'published',
        'YOUR_USER_UUID_HERE',
        NOW()
    ),
    (
        'Understanding Row Level Security',
        'Row Level Security (RLS) is a PostgreSQL feature that allows you to control access to rows in a table based on the user executing a query.',
        'published',
        'YOUR_USER_UUID_HERE',
        NOW() - INTERVAL '1 day'
    ),
    (
        'Draft: Advanced PostgreSQL Tips',
        'This article covers advanced PostgreSQL features including...',
        'draft',
        'YOUR_USER_UUID_HERE',
        NULL
    ),
    (
        'Building a Blog with Next.js',
        'Learn how to build a full-featured blog using Next.js and Supabase as the backend.',
        'published',
        'YOUR_USER_UUID_HERE',
        NOW() - INTERVAL '3 days'
    ),
    (
        'Work in Progress: API Design Best Practices',
        'Notes on API design patterns and best practices...',
        'draft',
        'YOUR_USER_UUID_HERE',
        NULL
    );
*/

-- Placeholder comment to ensure file is not empty
-- Add your seed data above after creating users in Supabase Auth
SELECT 'Seed file loaded. Uncomment INSERT statements and add valid author_id to seed articles.' AS message;

-- Add foreign key from articles.author_id to profiles.id
-- so PostgREST can resolve the nested select: profiles(display_name)
ALTER TABLE public.articles
ADD CONSTRAINT articles_author_id_profiles_fkey
FOREIGN KEY (author_id) REFERENCES public.profiles(id);

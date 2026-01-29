-- Fix: use username part of email (before @) instead of full email as display_name fallback

-- Update the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1)));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix existing profiles whose display_name is a full email address
UPDATE public.profiles
SET display_name = SPLIT_PART(display_name, '@', 1)
WHERE display_name LIKE '%@%';

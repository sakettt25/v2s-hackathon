-- Add is_mayor flag to profiles
ALTER TABLE public.profiles ADD COLUMN is_mayor BOOLEAN DEFAULT false;

-- Optionally, set a default mayor for testing
UPDATE public.profiles SET is_mayor = true WHERE role = 'official';

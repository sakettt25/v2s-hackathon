-- 1. Ensure id auto-generates if we haven't already
ALTER TABLE public.profiles ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Add password_hash column for local login
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS password_hash TEXT;

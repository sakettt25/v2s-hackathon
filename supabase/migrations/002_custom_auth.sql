-- 1. Disconnect profiles from auth.users so we can manage users ourselves
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Add email to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- 3. Create OTP table for email verification
CREATE TABLE IF NOT EXISTS public.otps (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);

-- 4. Disable RLS across the board since we are moving away from Supabase Auth
-- Our Next.js Server Actions will now handle all authorization logic directly
ALTER TABLE public.issues DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.official_actions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 5. Drop the old auth.users triggers to prevent errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user;

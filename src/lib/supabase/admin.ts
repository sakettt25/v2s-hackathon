import { createClient } from "@supabase/supabase-js";

// Service role client — USE ONLY ON SERVER SIDE
// This bypasses RLS and has full admin access
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

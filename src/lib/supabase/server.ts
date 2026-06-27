import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Since we removed Supabase Auth and RLS, we use the Service Role Key on the server
// to bypass the now-disabled RLS and execute all queries natively.
// IMPORTANT: Never use this client in Client Components.

export async function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wmlkuecaywpnyaycperb.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "dummy_key_should_not_happen_because_its_runtime"
  );
}

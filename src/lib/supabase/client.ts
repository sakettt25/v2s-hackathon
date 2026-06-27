import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://wmlkuecaywpnyaycperb.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbGt1ZWNheXdwbnlheWNwZXJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIyOTgwNzgsImV4cCI6MjA5Nzg3NDA3OH0.cB6aozQwOH6NNLYjVBjJFyzvRk8_eSKLlevVyas6ZPE"
  );
}

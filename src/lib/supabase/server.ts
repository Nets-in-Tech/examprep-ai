import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getSupabaseServerClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (
    !supabaseUrl ||
    !serviceKey ||
    supabaseUrl.includes("placeholder-project") ||
    serviceKey.includes("placeholder")
  ) {
    return null;
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

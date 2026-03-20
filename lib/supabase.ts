import { createBrowserClient as _createBrowserClient } from "@supabase/ssr";

/**
 * Client-side Supabase helper for anonymous MVP usage.
 *
 * Note: this project uses `@supabase/ssr` to get a browser-safe client with
 * the expected cookies/session handling.
 */
export function createBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. Check your .env.local."
    );
  }

  // We don't have a typed database schema in this MVP yet, so we keep the generics broad.
  return _createBrowserClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
}


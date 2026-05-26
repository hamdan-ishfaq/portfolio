// lib/supabase/server.ts
// Server Component / Server Action client. Reads session from cookies.
// THIS FILE IS SERVER-ONLY — never import in 'use client' components.
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can fail when called from a Server Component
            // (as opposed to a Server Action or Route Handler).
            // This is safe to ignore if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}

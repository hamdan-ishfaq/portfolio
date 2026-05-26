// lib/supabase/admin.ts
// Service role client — bypasses Row Level Security.
// THIS FILE IS SERVER-ONLY — never import in client components.
import { createClient } from '@supabase/supabase-js';

function createAdminClient() {
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

export const adminSupabase = createAdminClient();

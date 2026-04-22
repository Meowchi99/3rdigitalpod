import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(list) {
          try {
            list.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Setting cookies from a Server Component is a no-op — safely ignore.
          }
        },
      },
    }
  );
}

/**
 * Service-role client that bypasses RLS.
 * USE WITH CAUTION — only in server code that verifies permissions itself
 * (e.g., admin API routes, Stripe webhooks).
 */
export function createServiceRoleClient() {
  const { createClient: createRaw } = require('@supabase/supabase-js');
  return createRaw(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

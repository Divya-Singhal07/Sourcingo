
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Missing SUPABASE_URL or SUPABASE_PUBLISHABLE_KEY in .env"
  );
}

// Public client: use for signup, login and public queries.
export const supabasePublic = createClient(
  supabaseUrl,
  supabaseKey
);

// User-scoped client: requests run with the user's access token,
// allowing Supabase RLS policies to apply.
export function createUserClient(accessToken: string) {
  return createClient(supabaseUrl!, supabaseKey!, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

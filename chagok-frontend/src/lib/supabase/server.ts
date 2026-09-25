import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseConfig } from "./config";

/** Per-request client. Only Server Actions and Route Handlers may write here. */
export async function createClient(writable = false) {
  const store = await cookies();
  const { url, key } = getSupabaseConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      ...(writable ? {
        setAll: (values: { name: string; value: string; options: import("@supabase/ssr").CookieOptions }[]) => {
          values.forEach(({ name, value, options }) => store.set(name, value, options));
        },
      } : {}),
    },
  });
}

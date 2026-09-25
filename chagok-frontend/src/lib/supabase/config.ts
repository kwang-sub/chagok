/** Public Supabase configuration only; never accepts privileged or legacy signing keys. */
export function getSupabaseConfig(
  url = process.env.NEXT_PUBLIC_SUPABASE_URL,
  key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
) {
  if (!url?.trim() || !key?.startsWith("sb_publishable_")) {
    throw new Error("Supabase URL and publishable key must be configured");
  }
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Supabase URL must be an HTTP(S) origin");
  }
  if (!["http:", "https:"].includes(parsed.protocol) || parsed.username || parsed.password ||
      parsed.pathname !== "/" || parsed.search || parsed.hash) {
    throw new Error("Supabase URL must be an HTTP(S) origin");
  }
  return { url: parsed.origin, key };
}

import type { SupabaseClient } from "@supabase/supabase-js";

export const oauthFailureMessage = "로그인하지 못했습니다. Google로 다시 시도해 주세요.";
export const oauthFailurePath = "/login?oauth=failed";

/** The caller supplies window.location.origin, never a query or form destination. */
export async function startGoogleOAuth(
  createAuth: () => Pick<SupabaseClient["auth"], "signInWithOAuth">,
  origin: string,
): Promise<{ error: string | null }> {
  try {
    const url = new URL(origin);
    if (!/^https?:$/.test(url.protocol) || url.origin !== origin) throw new Error("Invalid origin");
    const { data, error } = await createAuth().signInWithOAuth({
      provider: "google",
      options: { redirectTo: new URL("/auth/callback", url).href },
    });
    return { error: !error && data.url ? null : oauthFailureMessage };
  } catch {
    return { error: oauthFailureMessage };
  }
}

/** Fixed destinations only; never forward codes, next, or provider errors. */
export async function exchangeOAuthCode(
  createAuth: () => Promise<Pick<SupabaseClient["auth"], "exchangeCodeForSession">>,
  params: URLSearchParams,
): Promise<"/" | typeof oauthFailurePath> {
  const code = params.get("code");
  if (!code?.trim() || code.length > 4096 || params.getAll("code").length !== 1 || params.has("error")) {
    return oauthFailurePath;
  }
  try {
    const { data, error } = await (await createAuth()).exchangeCodeForSession(code);
    return !error && data.session && data.user ? "/" : oauthFailurePath;
  } catch {
    return oauthFailurePath;
  }
}

import type { SupabaseClient } from "@supabase/supabase-js";

export type AuthState = { error: string | null };

/** Server-side validation complements native browser form validation. Never return credentials. */
export async function signInWithForm(
  auth: Pick<SupabaseClient["auth"], "signInWithPassword">,
  form: FormData,
): Promise<AuthState> {
  const email = form.get("email");
  const password = form.get("password");
  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
      email.length > 254 || typeof password !== "string" || !password || password.length > 4096) {
    return { error: "올바른 이메일과 비밀번호를 입력해 주세요." };
  }
  const { error } = await auth.signInWithPassword({ email: email.trim(), password });
  return { error: error ? "로그인하지 못했습니다. 입력 정보를 확인하거나 잠시 후 다시 시도해 주세요." : null };
}

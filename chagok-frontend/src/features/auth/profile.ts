import type { User } from "@supabase/supabase-js";

export const displayNameMaxLength = 50;
export type UserProfile = Readonly<{ displayName: string; email: string }>;
export type ProfileFormState = {
  status: "idle" | "error" | "success";
  message: string;
  fieldError: string | null;
  displayName: string;
};

export function validateDisplayName(value: unknown): { value: string; error: string | null } {
  const name = typeof value === "string" ? value.trim() : "";
  if (!name) return { value: name, error: "표시 이름을 입력해 주세요." };
  if (name.length > displayNameMaxLength) return { value: name, error: "표시 이름은 50자 이내로 입력해 주세요." };
  return { value: name, error: null };
}

/** Only call with the user returned by remote getUser verification, never cookie metadata. */
export function toUserProfile(user: Pick<User, "user_metadata" | "email">): UserProfile {
  const email = typeof user.email === "string" ? user.email.trim() : "";
  const metadata = user.user_metadata;
  const candidates: unknown[] = [metadata?.display_name, metadata?.full_name, metadata?.name, email.split("@")[0]];
  const displayName = candidates.map(validateDisplayName).find((name) => !name.error)?.value ?? "사용자";
  return { displayName, email };
}

import type { SupabaseClient } from "@supabase/supabase-js";
import { getVerifiedSession } from "./session";
import { validateDisplayName, type ProfileFormState } from "./profile";

type ProfileAuth = Pick<SupabaseClient["auth"], "getSession" | "getUser" | "updateUser">;

export async function updateDisplayName(auth: ProfileAuth, input: unknown): Promise<ProfileFormState> {
  const name = validateDisplayName(input);
  const failure: ProfileFormState = { status: "error", displayName: name.value, fieldError: null, message: "표시 이름을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  try {
    const verified = await getVerifiedSession(auth);
    if (name.error) return { ...failure, fieldError: name.error, message: "" };
    const { data, error } = await auth.updateUser({ data: { display_name: name.value } });
    if (error || !data.user || data.user.id !== verified.userId) return failure;
    return { status: "success", displayName: name.value, fieldError: null, message: "표시 이름을 저장했습니다." };
  } catch {
    return failure;
  }
}

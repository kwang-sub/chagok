"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ProfileFormState } from "./profile";
import { updateDisplayName } from "./profile-update";

export async function saveProfile(_previous: ProfileFormState, formData: FormData): Promise<ProfileFormState> {
  let result: ProfileFormState;
  try {
    const supabase = await createClient(true);
    result = await updateDisplayName(supabase.auth, formData.get("displayName"));
  } catch {
    return { status: "error", displayName: "", fieldError: null, message: "표시 이름을 저장하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }
  if (result.status === "success") {
    revalidatePath("/settings");
    revalidatePath("/");
  }
  return result;
}

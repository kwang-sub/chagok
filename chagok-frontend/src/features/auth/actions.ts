"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { signInWithForm, type AuthState } from "./credentials";

export async function signIn(_previous: AuthState, form: FormData): Promise<AuthState> {
  const supabase = await createClient(true);
  const state = await signInWithForm(supabase.auth, form);
  if (state.error) return state;
  revalidatePath("/", "layout");
  redirect("/");
}

export async function signOut(): Promise<AuthState> {
  const supabase = await createClient(true);
  const { error } = await supabase.auth.signOut({ scope: "local" });
  if (error) return { error: "로그아웃하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  revalidatePath("/", "layout");
  redirect("/login");
}

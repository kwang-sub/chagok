import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase/server";
import { ApiHttpError } from "../../lib/api/http-client";
import { getVerifiedSession } from "./session";

/** Page/action guard, independent of Proxy matching. Never serialize the result to client props. */
export async function requireSession() {
  const supabase = await createClient();
  try {
    return await getVerifiedSession(supabase.auth);
  } catch (error) {
    if (error instanceof ApiHttpError && error.status === 401) redirect("/login");
    throw error;
  }
}

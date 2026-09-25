import type { SupabaseClient } from "@supabase/supabase-js";
import { ApiHttpError } from "../../lib/api/http-client";

/** getSession alone is untrusted cookie data. Validate the exact forwarded token remotely. */
export async function getVerifiedSession(auth: Pick<SupabaseClient["auth"], "getSession" | "getUser">) {
  const { data: { session }, error } = await auth.getSession();
  if (error || !session?.access_token) throw new ApiHttpError(401);
  const { data: { user }, error: userError } = await auth.getUser(session.access_token);
  if (userError || !user) throw new ApiHttpError(401);
  return { accessToken: session.access_token, userId: user.id };
}

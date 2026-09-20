import "server-only";
import { getBackendBaseUrl } from "@/config/backend";
import { createPocClient } from "./client";
import { requireSession } from "../auth/session.server";

/** Server component/action entry. Never import the backend config in client UI. */
export async function getPocClient() {
  const { accessToken } = await requireSession();
  return createPocClient(getBackendBaseUrl(), fetch, accessToken);
}

import "server-only";
import { getBackendBaseUrl } from "../../config/backend";
import { createPocClient } from "./client";

/** Server component/action entry. Never import the backend config in client UI. */
export function getPocClient() {
  return createPocClient(getBackendBaseUrl());
}

/** Read lazily so the unconnected shell builds without a backend. */
export function getBackendBaseUrl(value = process.env.BACKEND_BASE_URL): string {
  if (!value?.trim()) throw new Error("BACKEND_BASE_URL is required");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("BACKEND_BASE_URL must be an HTTP(S) origin");
  }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password ||
      url.pathname !== "/" || url.search || url.hash) {
    throw new Error("BACKEND_BASE_URL must be an HTTP(S) origin");
  }
  return url.origin;
}

export class ApiHttpError extends Error {
  constructor(readonly status: number) {
    super(`Backend request failed (HTTP ${status})`);
    this.name = "ApiHttpError";
  }
}

/** Transport returns unknown; endpoint decoders own the wire contract. */
export function createHttpClient(baseUrl: string, fetcher: typeof fetch = fetch, accessToken?: string) {
  return async (path: string, init: RequestInit = {}): Promise<unknown> => {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
    const url = new URL(path, baseUrl);
    if (url.origin !== new URL(baseUrl).origin) throw new Error("Backend request must stay on its configured origin");
    const response = await fetcher(url, {
      ...init,
      headers,
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) throw new ApiHttpError(response.status);
    return response.json();
  };
}

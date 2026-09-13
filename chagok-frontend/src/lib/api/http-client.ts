export class ApiHttpError extends Error {
  constructor(readonly status: number) {
    super(`Backend request failed (HTTP ${status})`);
    this.name = "ApiHttpError";
  }
}

/** Transport returns unknown; endpoint decoders own the wire contract. */
export function createHttpClient(baseUrl: string, fetcher: typeof fetch = fetch) {
  return async (path: string, init: RequestInit = {}): Promise<unknown> => {
    const headers = new Headers(init.headers);
    headers.set("Accept", "application/json");
    const response = await fetcher(new URL(path, baseUrl), {
      ...init,
      headers,
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok) throw new ApiHttpError(response.status);
    return response.json();
  };
}

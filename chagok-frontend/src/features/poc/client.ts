import { createHttpClient } from "../../lib/api/http-client";
import type { SearchEtfsQuery } from "../../types/poc";
import { decodeEtfs, decodeLatestBaseDate, decodeMarketPrice } from "./decoders";

/** Wire adapter; application code enters through api.server.ts. No implicit retries. */
export function createPocClient(baseUrl: string, fetcher: typeof fetch = fetch) {
  const request = createHttpClient(baseUrl, fetcher);
  return {
    async latestBaseDate(signal?: AbortSignal) {
      return decodeLatestBaseDate(await request("/api/poc/etfs/latest-base-date", { signal: signal ?? null }));
    },
    async searchEtfs(query: SearchEtfsQuery = {}, signal?: AbortSignal) {
      const params = new URLSearchParams();
      if (query.keyword !== undefined) params.set("keyword", query.keyword);
      if (query.page !== undefined) params.set("page", String(query.page));
      if (query.size !== undefined) params.set("size", String(query.size));
      const suffix = params.size ? `?${params}` : "";
      return decodeEtfs(await request(`/api/poc/etfs${suffix}`, { signal: signal ?? null }));
    },
    async verifyMarketPrice(ticker: string, signal?: AbortSignal) {
      // Avoid empty/dot segments being normalized into a different route by URL.
      if (!ticker || ticker === "." || ticker === "..") throw new Error("Ticker path segment is required");
      return decodeMarketPrice(await request(`/api/poc/etfs/${encodeURIComponent(ticker)}/market-price`, {
        method: "POST", signal: signal ?? null,
      }));
    },
  };
}

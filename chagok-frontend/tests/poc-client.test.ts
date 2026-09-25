import assert from "node:assert/strict";
import { test } from "node:test";
import { getBackendBaseUrl } from "../src/config/backend";
import { createPocClient } from "../src/features/poc/client";
import { ApiContractError, decodeEtfs, decodeMarketPrice } from "../src/features/poc/decoders";
import { ApiHttpError } from "../src/lib/api/http-client";

const etf = {
  basDt: "20260911", srtnCd: "069500", isinCd: null, itmsNm: "테스트 ETF",
  clpr: "12345.67", mkp: null, hipr: null, lopr: null, vs: null, fltRt: null,
  trqu: null, trPrc: null, nav: null, mrktTotAmt: null,
};
const market = {
  ticker: "069500", name: null, publicDataBaseDate: null, publicDataClosePrice: "12345.67",
  googleFinance: { googleTicker: "KRX:069500", price: 12345.67, tradeTime: null, dataDelay: 20, changePercent: null },
};
function stub(payload: unknown, inspect: (input: string | URL | Request, init?: RequestInit) => void = () => {}) {
  const fetcher: typeof fetch = async (input, init) => {
    inspect(input, init);
    return Response.json(payload);
  };
  return createPocClient("http://localhost:8080", fetcher);
}

test("backend config accepts an origin and rejects missing/unsafe configuration without leaking it", () => {
  assert.equal(getBackendBaseUrl("http://localhost:8080/"), "http://localhost:8080");
  for (const value of ["", "bad", "ftp://example.org", "https://user:secret@example.org", "https://example.org/path", "https://example.org?q=x", "https://example.org/#x"]) {
    assert.throws(() => getBackendBaseUrl(value), /BACKEND_BASE_URL/);
  }
});

test("latest date uses the endpoint, no-store, JSON accept and abort signal", async () => {
  const signal = new AbortController().signal;
  const client = stub({ baseDate: "20260911" }, (input, init) => {
    assert.equal(String(input), "http://localhost:8080/api/poc/etfs/latest-base-date");
    assert.equal(init?.cache, "no-store");
    assert.equal(init?.redirect, "error");
    assert.equal(new Headers(init?.headers).get("Accept"), "application/json");
    assert.equal(init?.signal, signal);
  });
  assert.deepEqual(await client.latestBaseDate(signal), { baseDate: "20260911" });
});

test("search preserves nullable fields and decimal strings and encodes query", async () => {
  const client = stub([etf], (input) => {
    const url = new URL(String(input));
    assert.equal(url.pathname, "/api/poc/etfs");
    assert.equal(url.searchParams.get("keyword"), "ETF & 한글");
    assert.equal(url.searchParams.get("page"), "2");
    assert.equal(url.searchParams.get("size"), "5");
  });
  assert.deepEqual(await client.searchEtfs({ keyword: "ETF & 한글", page: 2, size: 5 }), [etf]);
});

test("search leaves defaults to backend and permits an empty response array", async () => {
  assert.deepEqual(await stub([], (input) => assert.equal(String(input), "http://localhost:8080/api/poc/etfs")).searchEtfs(), []);
});

test("market price uses encoded ticker, POST without a body, and nested nullable response", async () => {
  const client = stub(market, (input, init) => {
    assert.equal(new URL(String(input)).pathname, "/api/poc/etfs/A%2FB%3F/market-price");
    assert.equal(init?.method, "POST");
    assert.equal(init?.body, undefined);
  });
  assert.deepEqual(await client.verifyMarketPrice("A/B?"), market);
});

test("empty and dot ticker segments cannot change the route", async () => {
  for (const ticker of ["", ".", ".."]) await assert.rejects(stub(market).verifyMarketPrice(ticker));
});

test("decoders reject missing fields, wrong primitives, envelopes and invalid nested values", async () => {
  assert.throws(() => decodeEtfs({ items: [] }), ApiContractError);
  assert.throws(() => decodeEtfs([{ ...etf, clpr: 123 }]), ApiContractError);
  assert.throws(() => decodeEtfs([{}]), ApiContractError);
  assert.throws(() => decodeMarketPrice({ ...market, googleFinance: null }), ApiContractError);
  assert.throws(() => decodeMarketPrice({ ...market, googleFinance: { ...market.googleFinance, dataDelay: 1.5 } }), ApiContractError);
  await assert.rejects(stub({ baseDate: null }).latestBaseDate(), ApiContractError);
});

test("all nullable market fields may be null", () => {
  const nullable = { ...market, googleFinance: { googleTicker: null, price: null, tradeTime: null, dataDelay: null, changePercent: null } };
  assert.deepEqual(decodeMarketPrice(nullable), nullable);
});

test("HTTP errors preserve status without surfacing an untrusted error body", async () => {
  const client = createPocClient("http://localhost:8080", async () => new Response("private upstream detail", { status: 503 }));
  await assert.rejects(client.latestBaseDate(), (error: unknown) => {
    assert.ok(error instanceof ApiHttpError);
    assert.equal(error.status, 503);
    assert.equal(error.message.includes("private"), false);
    return true;
  });
});

test("network, cancellation and malformed JSON failures are not swallowed or retried", async () => {
  const failure = new DOMException("Cancelled", "AbortError");
  let calls = 0;
  const client = createPocClient("http://localhost:8080", async () => { calls++; throw failure; });
  await assert.rejects(client.verifyMarketPrice("069500"), (error: unknown) => error === failure);
  assert.equal(calls, 1);
  const invalid = createPocClient("http://localhost:8080", async () => new Response("not json"));
  await assert.rejects(invalid.latestBaseDate(), SyntaxError);
});

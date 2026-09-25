import type { EtfPriceItem, LatestBaseDate, PocMarketPriceResponse } from "../../types/poc";

export class ApiContractError extends Error {
  constructor() {
    super("Unexpected PoC API response");
    this.name = "ApiContractError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function record(value: unknown): Record<string, unknown> {
  if (!isRecord(value)) throw new ApiContractError();
  return value;
}

function text(value: unknown): string {
  if (typeof value !== "string") throw new ApiContractError();
  return value;
}

function nullableText(value: unknown): string | null {
  return value === null ? null : text(value);
}

function nullableNumber(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) throw new ApiContractError();
  return value;
}

export function decodeLatestBaseDate(value: unknown): LatestBaseDate {
  return { baseDate: text(record(value).baseDate) };
}

function decodeEtf(value: unknown): EtfPriceItem {
  const item = record(value);
  return {
    basDt: nullableText(item.basDt), srtnCd: nullableText(item.srtnCd),
    isinCd: nullableText(item.isinCd), itmsNm: nullableText(item.itmsNm),
    clpr: nullableText(item.clpr), mkp: nullableText(item.mkp),
    hipr: nullableText(item.hipr), lopr: nullableText(item.lopr),
    vs: nullableText(item.vs), fltRt: nullableText(item.fltRt),
    trqu: nullableText(item.trqu), trPrc: nullableText(item.trPrc),
    nav: nullableText(item.nav), mrktTotAmt: nullableText(item.mrktTotAmt),
  };
}

export function decodeEtfs(value: unknown): EtfPriceItem[] {
  if (!Array.isArray(value)) throw new ApiContractError();
  return value.map(decodeEtf);
}

export function decodeMarketPrice(value: unknown): PocMarketPriceResponse {
  const item = record(value);
  const google = record(item.googleFinance);
  const dataDelay = nullableNumber(google.dataDelay);
  if (dataDelay !== null && !Number.isInteger(dataDelay)) throw new ApiContractError();
  return {
    ticker: text(item.ticker), name: nullableText(item.name),
    publicDataBaseDate: nullableText(item.publicDataBaseDate),
    publicDataClosePrice: nullableText(item.publicDataClosePrice),
    googleFinance: {
      googleTicker: nullableText(google.googleTicker), price: nullableNumber(google.price),
      tradeTime: nullableText(google.tradeTime), dataDelay,
      changePercent: nullableNumber(google.changePercent),
    },
  };
}

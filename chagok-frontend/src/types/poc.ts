// Source: backend EtfPriceItem, PocMarketPriceResponse and MarketDataRow.
// Nullable fields are present in the current Jackson response, not optional.
export interface LatestBaseDate { baseDate: string }
export interface EtfPriceItem {
  basDt: string | null;
  srtnCd: string | null;
  isinCd: string | null;
  itmsNm: string | null;
  clpr: string | null;
  mkp: string | null;
  hipr: string | null;
  lopr: string | null;
  vs: string | null;
  fltRt: string | null;
  trqu: string | null;
  trPrc: string | null;
  nav: string | null;
  mrktTotAmt: string | null;
}
export interface MarketDataRow {
  googleTicker: string | null;
  price: number | null;
  tradeTime: string | null;
  dataDelay: number | null;
  changePercent: number | null;
}
export interface PocMarketPriceResponse {
  ticker: string;
  name: string | null;
  publicDataBaseDate: string | null;
  publicDataClosePrice: string | null;
  googleFinance: MarketDataRow;
}
export interface SearchEtfsQuery { keyword?: string; page?: number; size?: number }

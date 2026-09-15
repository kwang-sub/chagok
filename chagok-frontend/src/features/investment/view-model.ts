/** UI fixtures only: these types are not backend DTOs or order contracts. */
export type FundingType = "REGULAR" | "ADDITIONAL" | "ONE_OFF";
export type FundingStatus = "SCHEDULED" | "AVAILABLE" | "ON_HOLD" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED" | "INACTIVE";
export const fundingTypes: Record<FundingType, string> = { REGULAR: "정기 투자", ADDITIONAL: "추가 납입", ONE_OFF: "일시 투자" };
export const fundingStatuses: Record<FundingStatus, string> = { SCHEDULED: "예정", AVAILABLE: "투자 가능", ON_HOLD: "보류", IN_PROGRESS: "진행", COMPLETED: "완료", SKIPPED: "건너뛰기", INACTIVE: "비활성" };
export type SuggestionStatus = "PENDING" | "BUY_COMPLETED" | "SELL_COMPLETED" | "SKIPPED";
export interface Suggestion {
  readonly name: string;
  readonly side: "BUY" | "SELL";
  readonly target: string;
  readonly amount: string;
  readonly quantity: string;
  readonly status: SuggestionStatus;
}
export interface Execution {
  readonly name: string;
  readonly side: "BUY" | "SELL";
  readonly amount: string;
  readonly quantity: string;
  readonly fee: string;
}
export interface Funding {
  readonly id: string;
  readonly date: string;
  readonly type: FundingType;
  readonly account: string;
  readonly amount: string;
  readonly status: FundingStatus;
  readonly completedAt: string | null;
  readonly memo: string;
  readonly priceAt: string;
  readonly suggestions: readonly Suggestion[];
  readonly executions: readonly Execution[];
}
export interface Holding {
  readonly ticker: string;
  readonly name: string;
  readonly account: string;
  readonly category: string;
  readonly quantity: string;
  readonly average: string;
  readonly price: string;
  readonly valuation: string;
  readonly profit: string;
  readonly returnRate: string;
  readonly target: string;
  readonly weight: string;
  readonly color: string;
}
export interface FundingFilters {
  readonly type: string;
  readonly status: string;
  readonly account: string;
  readonly keyword: string;
  readonly from: string;
  readonly to: string;
}
export const defaultFilters: FundingFilters = { type: "", status: "", account: "", keyword: "", from: "2025-01-01", to: "2025-12-31" };

/** Dates in this local view model use sortable ISO calendar strings. */
export function filterFundings(items: readonly Funding[], filters: FundingFilters) {
  const keyword = filters.keyword.trim().toLocaleLowerCase("ko-KR");
  return items.filter((item) =>
    (!filters.type || item.type === filters.type) &&
    (!filters.status || item.status === filters.status) &&
    (!filters.account || item.account === filters.account) &&
    (!filters.from || item.date >= filters.from) &&
    (!filters.to || item.date <= filters.to) &&
    `${item.memo} ${item.account} ${item.id}`.toLocaleLowerCase("ko-KR").includes(keyword),
  );
}

/** Aggregate fixture KRW amounts exactly, never via floating-point conversion. */
export function fundingSummary(items: readonly Funding[]) {
  const sum = (status?: FundingStatus) => items.filter((item) => !status || item.status === status)
    .reduce((total, item) => total + BigInt(item.amount), 0n).toString();
  return { total: sum(), completed: sum("COMPLETED"), progress: sum("IN_PROGRESS"), held: sum("ON_HOLD"), skipped: sum("SKIPPED") };
}

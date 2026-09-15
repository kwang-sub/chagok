import type { Funding, Holding, Suggestion, Execution } from "./view-model";

export const priceAt = "2025-09-11 09:30 KST";
export const holdings: readonly Holding[] = [
  { ticker: "005930", name: "삼성전자", account: "A계좌 (삼성증권)", category: "국내 주식", quantity: "100", average: "70000", price: "75000", valuation: "7500000", profit: "+500000", returnRate: "+7.14", target: "25", weight: "28.1", color: "blue" },
  { ticker: "360750", name: "TIGER 미국S&P500", account: "ISA계좌 (KB)", category: "ETF", quantity: "200", average: "12000", price: "14200", valuation: "2840000", profit: "+440000", returnRate: "+18.34", target: "20", weight: "20", color: "gold" },
  { ticker: "AAPL", name: "애플", account: "해외주식계좌", category: "해외 주식", quantity: "50", average: "150", price: "180", valuation: "12400000", profit: "+2070000", returnRate: "+20.03", target: "15", weight: "17.3", color: "slate" },
  { ticker: "TSLA", name: "테슬라", account: "해외주식계좌", category: "해외 주식", quantity: "30", average: "220", price: "250", valuation: "10250000", profit: "+1570000", returnRate: "+18.08", target: "15", weight: "14.3", color: "red" },
  { ticker: "302770", name: "TIGER 미국채10년선물", account: "A계좌 (삼성증권)", category: "채권", quantity: "100", average: "10000", price: "10200", valuation: "1020000", profit: "+20000", returnRate: "+2.00", target: "10", weight: "12", color: "blue" },
  { ticker: "091160", name: "KODEX 반도체", account: "ISA계좌 (KB)", category: "ETF", quantity: "150", average: "50000", price: "51000", valuation: "7650000", profit: "+150000", returnRate: "+2.00", target: "10", weight: "10.1", color: "purple" },
  { ticker: "005380", name: "현대차", account: "A계좌 (삼성증권)", category: "국내 주식", quantity: "50", average: "180000", price: "200000", valuation: "10000000", profit: "+1000000", returnRate: "+11.11", target: "5", weight: "6.9", color: "blue" },
];
// These snapshots illustrate UI only, not a simulation algorithm or live portfolio reconciliation.
const suggestions: readonly Suggestion[] = [
  { name: "삼성전자", side: "BUY", target: "25", amount: "250000", quantity: "3", status: "BUY_COMPLETED" },
  { name: "TIGER 미국S&P500", side: "BUY", target: "20", amount: "200000", quantity: "14", status: "BUY_COMPLETED" },
  { name: "현대차", side: "BUY", target: "10", amount: "100000", quantity: "0", status: "SKIPPED" },
  { name: "테슬라", side: "SELL", target: "15", amount: "150000", quantity: "1", status: "SELL_COMPLETED" },
];
const executions: readonly Execution[] = [
  { name: "삼성전자", side: "BUY", amount: "247500", quantity: "3", fee: "500" },
  { name: "TIGER 미국S&P500", side: "BUY", amount: "199200", quantity: "14", fee: "800" },
  { name: "테슬라", side: "SELL", amount: "151300", quantity: "1", fee: "700" },
];
export const fundings: readonly Funding[] = [
  { id: "fund-09", date: "2025-09-25", type: "REGULAR", account: "A계좌 (삼성증권)", amount: "1000000", status: "IN_PROGRESS", completedAt: null, memo: "9월 정기 투자", priceAt, suggestions: suggestions.map((item) => ({ ...item, status: "PENDING" })), executions: [] },
  { id: "fund-08", date: "2025-08-25", type: "REGULAR", account: "A계좌 (삼성증권)", amount: "1000000", status: "COMPLETED", completedAt: "2025-08-25", memo: "8월 정기 투자", priceAt: "2025-08-25 09:30 KST", suggestions, executions },
  { id: "fund-07", date: "2025-07-27", type: "ADDITIONAL", account: "ISA계좌 (KB)", amount: "500000", status: "COMPLETED", completedAt: "2025-07-27", memo: "보너스 투자", priceAt, suggestions: [], executions: [] },
  { id: "fund-06", date: "2025-06-25", type: "REGULAR", account: "A계좌 (삼성증권)", amount: "1000000", status: "COMPLETED", completedAt: "2025-06-25", memo: "6월 정기 투자", priceAt, suggestions: [], executions: [] },
  { id: "fund-05", date: "2025-05-15", type: "ONE_OFF", account: "해외주식계좌", amount: "2000000", status: "SKIPPED", completedAt: null, memo: "시장 변동성으로 건너뜀", priceAt, suggestions: [], executions: [] },
  { id: "fund-04", date: "2025-04-25", type: "REGULAR", account: "A계좌 (삼성증권)", amount: "1000000", status: "COMPLETED", completedAt: "2025-04-25", memo: "4월 정기 투자", priceAt, suggestions: [], executions: [] },
  { id: "fund-03", date: "2025-03-25", type: "ADDITIONAL", account: "ISA계좌 (KB)", amount: "1000000", status: "ON_HOLD", completedAt: null, memo: "일정 조정으로 보류", priceAt, suggestions: [], executions: [] },
  { id: "fund-02", date: "2025-02-25", type: "REGULAR", account: "A계좌 (삼성증권)", amount: "1000000", status: "COMPLETED", completedAt: "2025-02-25", memo: "2월 정기 투자", priceAt, suggestions: [], executions: [] },
  { id: "fund-01", date: "2025-01-25", type: "REGULAR", account: "A계좌 (삼성증권)", amount: "1000000", status: "COMPLETED", completedAt: "2025-01-25", memo: "1월 정기 투자", priceAt, suggestions: [], executions: [] },
];
export const accounts = [...new Set(fundings.map((item) => item.account))];
export const allocation = [
  { label: "국내 주식", value: "35.2", color: "#22a278" }, { label: "해외 주식", value: "28.4", color: "#4c8cea" },
  { label: "ETF", value: "20.1", color: "#8f6bdb" }, { label: "채권", value: "8.7", color: "#f5b448" },
  { label: "현금", value: "5.3", color: "#ee7f86" }, { label: "기타", value: "2.3", color: "#9aa4b4" },
];

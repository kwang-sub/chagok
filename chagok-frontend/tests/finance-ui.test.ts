import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { formatDecimal, percent, won } from "../src/lib/format-finance";
import { defaultFilters, filterFundings, fundingSummary, type Funding } from "../src/features/investment/view-model";
import { fundings, holdings } from "../src/features/investment/fixtures";
import { Donut, StairIllustration, TrendChart } from "../src/components/finance-ui";
import { FundingComparison } from "../src/features/investment/funding-flow";

test("financial display preserves signs, trailing zeros and arbitrary decimal precision", () => {
  assert.equal(formatDecimal("+12345678901234567890.00100"), "+12,345,678,901,234,567,890.00100");
  assert.equal(won("-1234.999"), "₩ -1,234.999");
  assert.equal(percent("0.00010"), "0.00010%");
  assert.equal(formatDecimal("0"), "0");
  for (const value of ["", "1e3", "NaN", "1,000", " 1", ".5", "12."]) {
    assert.throws(() => formatDecimal(value), /Invalid display decimal/);
  }
});

test("every holding numeric field is a valid display decimal, including detail-only profit", () => {
  for (const holding of holdings) {
    for (const field of ["quantity", "average", "price", "valuation", "profit", "returnRate", "target", "weight"] as const) {
      assert.doesNotThrow(() => formatDecimal(holding[field]), `${holding.ticker}.${field}`);
    }
  }
});

test("history filters compose type, status, account, inclusive dates and trimmed keyword without mutation", () => {
  const before = JSON.stringify(fundings);
  const visible = filterFundings(fundings, { ...defaultFilters, type: "ADDITIONAL", status: "COMPLETED", account: "ISA계좌 (KB)", from: "2025-07-27", to: "2025-07-27", keyword: " 보너스 " });
  assert.deepEqual(visible.map((item) => item.id), ["fund-07"]);
  assert.equal(filterFundings(fundings, { ...defaultFilters, keyword: "not-found" }).length, 0);
  assert.equal(filterFundings(fundings, { ...defaultFilters, from: "2025-12-31", to: "2025-01-01" }).length, 0);
  assert.equal(filterFundings(fundings, defaultFilters).length, fundings.length);
  assert.equal(JSON.stringify(fundings), before);
});

test("funding summary is exact beyond Number safe integers and distinguishes statuses", () => {
  const base = fundings[0];
  assert.ok(base);
  const items: Funding[] = [
    { ...base, amount: "9007199254740993", status: "COMPLETED" },
    { ...base, amount: "2", status: "IN_PROGRESS" },
    { ...base, amount: "3", status: "ON_HOLD" },
    { ...base, amount: "4", status: "SKIPPED" },
  ];
  assert.deepEqual(fundingSummary(items), { total: "9007199254741002", completed: "9007199254740993", progress: "2", held: "3", skipped: "4" });
  assert.deepEqual(fundingSummary([]), { total: "0", completed: "0", progress: "0", held: "0", skipped: "0" });
});

test("charts render graphics and accessible numeric meaning with deterministic donut stops", () => {
  const props = { label: "배분", value: "100원", segments: [{ label: "주식", value: "60", color: "red" }, { label: "현금", value: "40", color: "blue" }] };
  const markup = renderToStaticMarkup(createElement(Donut, props));
  assert.match(markup, /conic-gradient\(red 0% 60%, blue 60% 100%\)/);
  assert.match(markup, /aria-label="배분 100원. 주식 60%, 현금 40%"/);
  assert.equal(renderToStaticMarkup(createElement(Donut, props)), markup);
  assert.match(renderToStaticMarkup(createElement(TrendChart)), /<polyline/);
  assert.match(renderToStaticMarkup(createElement(TrendChart, { investment: true })), /평가금액/);
  assert.match(renderToStaticMarkup(createElement(StairIllustration)), /<svg/);
});

test("funding detail separates pending suggestions from executed results and exposes price timestamp", () => {
  const pending = fundings[0];
  const completed = fundings[1];
  assert.ok(pending && completed);
  const pendingMarkup = renderToStaticMarkup(createElement(FundingComparison, { funding: pending }));
  assert.match(pendingMarkup, /제안 대기/);
  assert.match(pendingMarkup, /실행 결과가 없습니다/);
  assert.match(pendingMarkup, /2025-09-11 09:30 KST/);
  const completedMarkup = renderToStaticMarkup(createElement(FundingComparison, { funding: completed }));
  assert.match(completedMarkup, /생성 시점 스냅샷/);
  assert.match(completedMarkup, /체결금액/);
  assert.match(completedMarkup, /247,500/);
  assert.match(completedMarkup, /수수료/);
});

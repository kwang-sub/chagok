import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { emptyFilters, filterItems, filterQuery, fixtures, formChanged, initialForm, listPage, readFilters } from "../src/features/account-card-management/model";
import { ResourceList } from "../src/features/account-card-management/resource-list";
import { ResourceDetail } from "../src/features/account-card-management/resource-detail";
import { ResourceForm } from "../src/features/account-card-management/resource-form";
import { StateMessage } from "../src/features/account-card-management/common";

test("sample filters compose and do not search identification suffixes", () => {
  const items = fixtures.accounts;
  const before = JSON.stringify(items);
  const selected = items[0];
  assert.ok(selected);
  const result = filterItems(items, { ...emptyFilters, query: " 생활비 ", institution: selected.institution, type: selected.type, owner: "나", status: "active" });
  assert.deepEqual(result.map((item) => item.id), [selected.id]);
  assert.equal(filterItems(items, { ...emptyFilters, query: selected.suffix }).length, 0);
  assert.equal(filterItems(items, { ...emptyFilters, status: "inactive" }).length, 1);
  assert.equal(filterItems(items, { ...emptyFilters, owner: "다른 구성원" }).length, 2);
  assert.equal(JSON.stringify(items), before);
});

test("list URL roundtrip restores allowed filters and bounds pagination", () => {
  const filters = { ...emptyFilters, query: "새봄", institution: "새봄은행 (샘플)", type: "입출금", owner: "나", status: "active", page: 2 };
  assert.deepEqual(readFilters(Object.fromEntries(new URLSearchParams(filterQuery(filters)))), filters);
  assert.equal(readFilters({ page: "-1" }).page, 1);
  assert.equal(readFilters({ page: "Infinity", query: ["one", "two"] }).query, "");
  assert.deepEqual(listPage(fixtures.cards, { ...emptyFilters, page: 500 }).items.map((item) => item.id), ["sample-6", "sample-7"]);
  assert.equal(listPage(fixtures.cards, { ...emptyFilters, query: "no-match" }).total, 0);
  assert.equal(filterQuery(readFilters({ number: "SAMPLE", returnTo: "https://invalid.example" })), "");
});

test("edit draft never receives masked or original number and tracks reversible dirtiness", () => {
  const initial = initialForm(fixtures.accounts[0]);
  assert.equal(initial.number, "");
  assert.equal(initial.replaceNumber, false);
  assert.equal(formChanged(initial, { ...initial }), false);
  assert.equal(formChanged(initial, { ...initial, number: "SAMPLE" }), true);
  assert.equal(formChanged(initial, { ...initial, replaceNumber: true }), true);
});

for (const kind of ["accounts", "cards"] as const) {
  test(`${kind}: list uses shared results and a single registration entry`, () => {
    const label = kind === "accounts" ? "계좌" : "카드";
    const markup = renderToStaticMarkup(createElement(ResourceList, { kind }));
    assert.equal((markup.match(new RegExp(`\\+ ${label} 등록`, "g")) ?? []).length, 1);
    assert.match(markup, /acm-desktop/);
    assert.match(markup, /acm-mobile/);
    assert.match(markup, /검색 결과 7개/);
    assert.doesNotMatch(markup, /총 잔액|연회비|유효기간|카드 혜택/);
  });

  test(`${kind}: one detail panel and badge; other owner is read only`, () => {
    const mine = renderToStaticMarkup(createElement(ResourceDetail, { kind, id: "sample-1" }));
    assert.equal((mine.match(/class="panel acm-detail"/g) ?? []).length, 1);
    assert.equal((mine.match(/class="badge /g) ?? []).length, 1);
    assert.match(mine, /비활성화/);
    assert.match(mine, /sample-1\/edit/);
    const other = renderToStaticMarkup(createElement(ResourceDetail, { kind, id: "sample-2" }));
    assert.match(other, /읽기 전용/);
    assert.doesNotMatch(other, /sample-2\/edit|<button[^>]*>비활성화/);
    const inactive = renderToStaticMarkup(createElement(ResourceDetail, { kind, id: "sample-7" }));
    assert.match(inactive, /disabled=""[^>]*>비활성화/);
    const missing = renderToStaticMarkup(createElement(ResourceDetail, { kind, id: "missing" }));
    assert.match(missing, /대상을 찾을 수 없습니다/);
    assert.doesNotMatch(missing, /acm-detail-heading/);
  });

  test(`${kind}: create/edit respect sample ownership and masking boundaries`, () => {
    const label = kind === "accounts" ? "계좌" : "카드";
    const create = renderToStaticMarkup(createElement(ResourceForm, { kind, filters: { ...emptyFilters, owner: "다른 구성원" } }));
    assert.match(create, new RegExp(`${label} 등록`));
    assert.match(create, /샘플 본인\(나\)/);
    assert.match(create, /입력 확인 \(저장 안 됨\)/);
    assert.doesNotMatch(create, /required=""|maxLength=|pattern=|연결계좌|결제계좌/);
    const edit = renderToStaticMarkup(createElement(ResourceForm, { kind, id: "sample-1" }));
    assert.match(edit, /기존 표시 끝자리: •••• S001/);
    assert.doesNotMatch(edit, /type="password"|value="••••/);
    const forbidden = renderToStaticMarkup(createElement(ResourceForm, { kind, id: "sample-2" }));
    assert.match(forbidden, /조회할 수 없습니다/);
    assert.doesNotMatch(forbidden, /<form/);
  });
}

test("preview loading, empty, no-result, error and access states remain distinct", () => {
  for (const state of ["loading", "empty", "no-result", "error", "denied", "not-found"] as const) {
    const markup = renderToStaticMarkup(createElement(StateMessage, { state, onRetry: () => {} }));
    assert.doesNotMatch(markup, /₩|0원/);
    assert.match(markup, state === "error" ? /role="alert"/ : /role="status"/);
  }
});

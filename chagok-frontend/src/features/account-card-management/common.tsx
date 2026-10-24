"use client";

import type { ReactNode } from "react";
import { filterQuery, resourceLabel, type Filters, type PreviewState, type ResourceKind } from "./model";

export const previewLabels: Record<PreviewState, string> = {
  normal: "정상", loading: "로딩", empty: "등록 없음", "no-result": "검색 결과 없음", error: "오류", denied: "접근 불가", "not-found": "대상 없음",
};
export function SampleHeader({ kind, title, filters, register = false }: { kind: ResourceKind; title: string; filters: Filters; register?: boolean }) {
  const shared = filterQuery({ ...filters, query: "", institution: "", type: "", status: "", page: 1 });
  return <>
    <header className="page-header"><div><h1>{title}</h1><p>계좌·카드 정보 관리</p></div>{register && <a className="button primary" href={`/${kind}/new${filterQuery(filters)}`}>+ {resourceLabel(kind)} 등록</a>}</header>
    <nav className="tabs" aria-label="계좌·카드"><a href={`/accounts${kind === "accounts" ? filterQuery(filters) : shared}`} aria-current={kind === "accounts" ? "page" : undefined}>계좌</a><a href={`/cards${kind === "cards" ? filterQuery(filters) : shared}`} aria-current={kind === "cards" ? "page" : undefined}>카드</a></nav>
    <p className="acm-notice">샘플 UI · 실제 데이터가 아닙니다. 저장·서버 인가·금융기관 연동은 연결되지 않았습니다. 실제 번호나 인증정보를 입력하지 마세요.</p>
  </>;
}
export function PreviewControl({ state, onChange, options = Object.keys(previewLabels) as PreviewState[] }: { state: PreviewState; onChange: (state: PreviewState) => void; options?: PreviewState[] }) {
  return <details className="preview-controls"><summary>샘플 화면 상태</summary><label>상태 선택 <select value={state} onChange={(event) => onChange(event.target.value as PreviewState)}>{options.map((key) => <option key={key} value={key}>{previewLabels[key]}</option>)}</select></label></details>;
}
export function StatusBadge({ active }: { active: boolean }) {
  return <span className={`badge ${active ? "status-AVAILABLE" : "status-INACTIVE"}`}>{active ? "사용중" : "비활성"}</span>;
}
export function StateMessage({ state, onRetry, children }: { state: Exclude<PreviewState, "normal">; onRetry: () => void; children?: ReactNode }) {
  const messages = { loading: "샘플 정보를 불러오는 중입니다.", empty: "등록된 샘플이 없습니다.", "no-result": "조건에 맞는 검색 결과가 없습니다.", error: "샘플 오류 상태입니다. 입력한 조건은 유지됩니다.", denied: "이 정보를 조회할 수 없습니다. (샘플 접근 제한)", "not-found": "대상을 찾을 수 없습니다. (샘플)" };
  return <section className="panel empty-state" aria-busy={state === "loading"}><p role={state === "error" ? "alert" : "status"}>{messages[state]}</p>{state !== "loading" && <button type="button" onClick={onRetry}>{state === "error" ? "샘플 재시도" : "정상 샘플 보기"}</button>}{children}</section>;
}

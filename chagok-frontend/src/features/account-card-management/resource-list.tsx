"use client";

import { useState } from "react";
import { PreviewControl, SampleHeader, StateMessage, StatusBadge } from "./common";
import { emptyFilters, filterQuery, fixtures, institutions, listPage, resourceLabel, resourceTypes, type Filters, type PreviewState, type ResourceKind } from "./model";

export function ResourceList({ kind, initialFilters = emptyFilters }: { kind: ResourceKind; initialFilters?: Filters }) {
  const [filters, setFilters] = useState(initialFilters);
  const [state, setState] = useState<PreviewState>("normal");
  const source = fixtures[kind];
  const result = listPage(source, filters);
  const update = (next: Filters) => {
    setFilters(next);
    window.history.replaceState(window.history.state, "", `/${kind}${filterQuery(next)}`);
  };
  const change = (key: keyof Filters, value: string) => update({ ...filters, [key]: value, page: 1 });
  const reset = () => { update({ ...emptyFilters }); setState("normal"); };
  const label = resourceLabel(kind);
  const selectFields = [
    { key: "institution" as const, label: kind === "accounts" ? "금융기관" : "카드사", values: institutions[kind] },
    { key: "type" as const, label: "유형", values: resourceTypes[kind] },
    { key: "owner" as const, label: "구성원", values: ["나", "다른 구성원"] },
  ];
  const href = (id: string) => `/${kind}/${id}${filterQuery({ ...filters, page: result.page })}`;
  return <div className="acm">
    <SampleHeader kind={kind} title={`${label} 목록`} filters={filters} register />
    <PreviewControl state={state} onChange={setState} />
    {state === "normal" && <section className="acm-summary" aria-label="샘플 가계 전체 요약"><div className="panel"><span>등록 {label}</span><strong>{source.length}개</strong></div><div className="panel"><span>사용중</span><strong>{source.filter((item) => item.active).length}개</strong></div><div className="panel"><span>비활성</span><strong>{source.filter((item) => !item.active).length}개</strong></div></section>}
    <section className="panel acm-filters" aria-label="목록 조회 조건">
      <label className="acm-search">이름·기관 검색<input type="search" value={filters.query} placeholder={`${label}명 또는 기관명`} onChange={(event) => change("query", event.target.value)} /></label>
      {selectFields.map((field) => <label key={field.key}>{field.label}<select value={filters[field.key]} onChange={(event) => change(field.key, event.target.value)}><option value="">전체 {field.label}</option>{field.values.map((value) => <option key={value}>{value}</option>)}</select></label>)}
      <label>상태<select value={filters.status} onChange={(event) => change("status", event.target.value)}><option value="">전체 상태</option><option value="active">사용중</option><option value="inactive">비활성</option></select></label>
      <button onClick={reset}>필터 초기화</button>
      <p className="muted acm-wide">구성원은 조회 조건입니다. 등록 소유자는 항상 샘플 본인(나)이며, 번호로 검색하지 않습니다.</p>
    </section>
    {state !== "normal" ? <StateMessage state={state} onRetry={() => setState("normal")} /> : <section className="panel acm-results" aria-label={`${label} 검색 결과`}>
      <div className="panel-heading"><h2>{label} 목록</h2><p role="status">검색 결과 {result.total}개</p></div>
      {result.total === 0 ? <div className="empty-state"><p role="status">조건에 맞는 검색 결과가 없습니다.</p><button onClick={reset}>필터 초기화</button></div> : <>
        <div className="acm-desktop"><table><caption className="sr-only">샘플 {label} 목록</caption><thead><tr><th scope="col">이름</th><th scope="col">기관</th><th scope="col">유형</th><th scope="col">구성원</th><th scope="col">식별정보</th><th scope="col">상태</th></tr></thead><tbody>{result.items.map((item) => <tr key={item.id}><td><a className="acm-item-link" href={href(item.id)}>{item.name} ›</a></td><td>{item.institution}</td><td>{item.type}</td><td>{item.owner}</td><td>•••• {item.suffix}</td><td><StatusBadge active={item.active} /></td></tr>)}</tbody></table></div>
        <ul className="acm-mobile">{result.items.map((item) => <li key={item.id}><a className="acm-mobile-item" href={href(item.id)}><div className="spread"><strong>{item.name}</strong><StatusBadge active={item.active} /></div><p>{item.institution} · {item.type}</p><p className="muted">{item.owner} · •••• {item.suffix} <span aria-hidden="true">›</span></p></a></li>)}</ul>
        <nav className="acm-pagination" aria-label="목록 페이지"><button disabled={result.page === 1} onClick={() => update({ ...filters, page: result.page - 1 })}>이전</button><span>{result.page} / {result.pages}</span><button disabled={result.page === result.pages} onClick={() => update({ ...filters, page: result.page + 1 })}>다음</button></nav>
      </>}
    </section>}
  </div>;
}

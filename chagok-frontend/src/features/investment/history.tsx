"use client";

import { useState } from "react";
import Link from "next/link";
import { Drawer } from "../../components/drawer";
import { DemoNotice, Kpi, StatusBadge } from "../../components/finance-ui";
import { StatePreview } from "../../components/state-preview";
import { won } from "../../lib/format-finance";
import { accounts, fundings } from "./fixtures";
import { defaultFilters, filterFundings, fundingStatuses, fundingSummary, fundingTypes, type Funding, type FundingFilters } from "./view-model";
import { FundingComparison, FundingEntry, InvestmentFlow } from "./funding-flow";

type HistoryModal = { kind: "detail" | "copy" | "invest"; funding: Funding } | { kind: "entry" } | null;
function HistoryDetail({ funding, onClose, onAction }: { funding: Funding; onClose: () => void; onAction: (kind: "copy" | "invest") => void }) {
  const [tab, setTab] = useState("comparison");
  return <Drawer title="투자 내역 상세" onClose={onClose}><DemoNotice/><div className="spread"><strong>{funding.date} <span className="type-label">{fundingTypes[funding.type]}</span></strong><StatusBadge status={funding.status}/></div><dl className="detail-list"><dt>계좌</dt><dd>{funding.account}</dd><dt>투자금액</dt><dd><strong>{won(funding.amount)}</strong></dd><dt>완료일</dt><dd>{funding.completedAt ?? "미완료"}</dd><dt>메모</dt><dd>{funding.memo}</dd></dl><div className="button-row"><button onClick={() => onAction("invest")}>다시 투자하기</button><button onClick={() => onAction("copy")}>복사하여 새로 등록</button></div><div className="tabs" aria-label="상세 내용"><button aria-pressed={tab === "comparison"} onClick={() => setTab("comparison")}>매수/매도 제안 · 실행 결과</button><button aria-pressed={tab === "memo"} onClick={() => setTab("memo")}>메모/이력</button></div>{tab === "comparison" ? <FundingComparison funding={funding}/> : <section><h3>메모</h3><p>{funding.memo}</p><p className="footnote">추가 변경 이력 예시가 없습니다.</p></section>}</Drawer>;
}
function Filters({ filters, onChange, onReset }: { filters: FundingFilters; onChange: (filters: FundingFilters) => void; onReset: () => void }) {
  const update = (key: keyof FundingFilters, value: string) => onChange({ ...filters, [key]: value });
  return <div className="history-filters"><label>시작일<input type="date" value={filters.from} max={filters.to || undefined} onChange={(event) => update("from", event.target.value)}/></label><label>종료일<input type="date" value={filters.to} min={filters.from || undefined} onChange={(event) => update("to", event.target.value)}/></label><label>투자유형<select value={filters.type} onChange={(event) => update("type", event.target.value)}><option value="">전체</option>{Object.entries(fundingTypes).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>계좌<select value={filters.account} onChange={(event) => update("account", event.target.value)}><option value="">전체</option>{accounts.map((account) => <option key={account}>{account}</option>)}</select></label><label>상태<select value={filters.status} onChange={(event) => update("status", event.target.value)}><option value="">전체</option>{Object.entries(fundingStatuses).map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>키워드<input type="search" placeholder="메모, 계좌명 검색" value={filters.keyword} onChange={(event) => update("keyword", event.target.value)}/></label><button onClick={onReset} aria-label="필터 초기화">↻</button></div>;
}
export function History({ initialFundingId }: { initialFundingId?: string }) {
  const [filters, setFilters] = useState<FundingFilters>(defaultFilters);
  const initial = fundings.find((funding) => funding.id === initialFundingId);
  const [modal, setModal] = useState<HistoryModal>(initial ? { kind: "detail", funding: initial } : null);
  const visible = filterFundings(fundings, filters);
  const summary = fundingSummary(visible);
  const close = () => setModal(null);
  return <><header className="page-header"><div><h1>투자 내역</h1><p>투자금 투입과 실행 결과를 한눈에</p></div><button className="primary" onClick={() => setModal({ kind: "entry" })}>＋ 투자금 등록</button></header><DemoNotice/><Link className="subtle-link" href="/investments">‹ 포트폴리오</Link><div className="tabs" aria-label="투자 유형">{[["", "전체 내역"], ...Object.entries(fundingTypes)].map(([key,label]) => <button key={key} aria-pressed={filters.type === key} onClick={() => setFilters({ ...filters, type: key ?? "" })}>{label}</button>)}</div>
    <StatePreview><div className="history-kpis"><Kpi label="총 투자금" value={won(summary.total)} detail={`${visible.length}건 · 현재 필터 기준`}/><Kpi label="완료 금액" value={won(summary.completed)} tone="positive" detail="완료된 Funding"/><Kpi label="진행 중 금액" value={won(summary.progress)} tone="blue-text" detail="실행 진행"/><Kpi label="보류 금액" value={won(summary.held)} detail="일시 보류"/><Kpi label="건너뛰기 금액" value={won(summary.skipped)} detail="미실행"/></div><section className="panel history-section" aria-label="투자금 투입 이력"><Filters filters={filters} onChange={setFilters} onReset={() => setFilters(defaultFilters)}/>{filters.from && filters.to && filters.from > filters.to && <p className="warning" role="alert">시작일은 종료일보다 늦을 수 없습니다.</p>}
    <div className="table-scroll desktop-history"><table><thead><tr><th>투자일</th><th>유형</th><th>계좌</th><th>투자금액</th><th>상태</th><th>완료일</th><th>매수/매도 결과</th><th>메모</th><th>액션</th></tr></thead><tbody>{visible.map((item) => <tr key={item.id}><td>{item.date}</td><td><span className={`type-label type-${item.type}`}>{fundingTypes[item.type]}</span></td><td>{item.account}</td><td>{won(item.amount)}</td><td><StatusBadge status={item.status}/></td><td>{item.completedAt ?? "—"}</td><td>{item.executions.length ? `${item.executions.length}개 실행 예시` : "—"}</td><td>{item.memo}</td><td><button className="text-button" aria-label={`${item.date} ${fundingTypes[item.type]} 상세`} onClick={() => setModal({ kind: "detail", funding: item })}>상세 ›</button></td></tr>)}</tbody></table></div>
    <div className="mobile-history">{visible.map((item) => <button className="history-mobile-row" key={item.id} onClick={() => setModal({ kind: "detail", funding: item })}><span>{item.date}<small className={`type-label type-${item.type}`}>{fundingTypes[item.type]}</small></span><span><b>{won(item.amount)}</b><small>{item.account}</small></span><StatusBadge status={item.status}/></button>)}</div>{!visible.length && <div className="empty-state" role="status"><h2>조건에 맞는 투자 내역이 없습니다</h2><button onClick={() => setFilters(defaultFilters)}>필터 초기화</button></div>}<div className="table-footer"><span role="status">총 {visible.length}건</span><span>전체 예시 내역 표시</span></div></section></StatePreview>
    {modal?.kind === "detail" && <HistoryDetail funding={modal.funding} onClose={close} onAction={(kind) => setModal({ kind, funding: modal.funding })}/>}
    {modal?.kind === "entry" && <FundingEntry onClose={close}/>}
    {modal?.kind === "copy" && <FundingEntry key={modal.funding.id} source={modal.funding} onClose={close}/>}
    {modal?.kind === "invest" && <InvestmentFlow funding={modal.funding} onClose={close}/>}
  </>;
}

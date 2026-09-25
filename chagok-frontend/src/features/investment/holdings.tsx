"use client";

import { useState } from "react";
import { Drawer } from "../../components/drawer";
import { formatDecimal, won } from "../../lib/format-finance";
import { holdings, priceAt } from "./fixtures";
import type { Holding } from "./view-model";

function HoldingDetail({ holding, onClose }: { holding: Holding; onClose: () => void }) {
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");
  const usd = holding.category === "해외 주식";
  return <Drawer title="종목 상세" onClose={onClose}><div className="holding-heading"><span className={`asset-icon ${holding.color}`}>{holding.name.slice(0,1)}</span><div><h3>{holding.name}</h3><span className="muted">{holding.ticker} · {holding.account}</span></div></div><p className="warning">예시 데이터 · 가격 기준 {priceAt}</p><dl className="detail-list"><dt>보유수량</dt><dd>{holding.quantity}주</dd><dt>평균매입가</dt><dd>{usd ? "$ " : "₩ "}{formatDecimal(holding.average)}</dd><dt>현재가</dt><dd>{usd ? "$ " : "₩ "}{formatDecimal(holding.price)}</dd><dt>평가금액 (원화)</dt><dd>{won(holding.valuation)}</dd><dt>평가손익</dt><dd className="positive">{won(holding.profit)} ({holding.returnRate}%)</dd><dt>목표비중</dt><dd>{holding.target}%</dd><dt>현재비중</dt><dd>{holding.weight}%</dd></dl><button onClick={() => setEditing(!editing)} aria-expanded={editing}>평균매입가 / 수량 / 목표비중 보정</button>
    {editing && <form className="funding-form" onSubmit={(event) => { event.preventDefault(); setMessage("보정 입력을 확인했습니다. 저장 및 평가금액 재계산은 수행하지 않습니다."); }}><label>평균매입가 ({usd ? "USD" : "KRW"})<input defaultValue={holding.average} inputMode="decimal" pattern="[0-9]+([.][0-9]+)?" required onChange={() => setMessage("")}/></label><label>보유수량<input defaultValue={holding.quantity} inputMode="decimal" pattern="[0-9]+([.][0-9]+)?" required onChange={() => setMessage("")}/></label><label>목표비중 (%)<input type="number" min="0" max="100" step="any" defaultValue={holding.target} required onChange={() => setMessage("")}/></label><p className="footnote">계좌 전체 비중 검증과 실제 보정은 미연결입니다.</p><button className="primary">입력 확인 (저장 안 됨)</button></form>}{message && <p role="status" className="success-notice">{message}</p>}
  </Drawer>;
}
export function Holdings() {
  const [query, setQuery] = useState("");
  const [account, setAccount] = useState("");
  const [category, setCategory] = useState("");
  const [selected, setSelected] = useState<Holding | null>(null);
  const visible = holdings.filter((holding) => (!account || holding.account === account) && (!category || holding.category === category) && `${holding.name} ${holding.ticker}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <section className="panel holdings-section"><div className="panel-heading"><h2>보유 종목 <span className="muted small">(표시 예시 {visible.length}개)</span></h2><div className="holding-filters"><label><span className="sr-only">보유 종목 계좌</span><select value={account} onChange={(event) => setAccount(event.target.value)}><option value="">전체 계좌</option>{[...new Set(holdings.map((h) => h.account))].map((a) => <option key={a}>{a}</option>)}</select></label><label><span className="sr-only">자산 유형</span><select value={category} onChange={(event) => setCategory(event.target.value)}><option value="">전체 자산유형</option>{[...new Set(holdings.map((h) => h.category))].map((a) => <option key={a}>{a}</option>)}</select></label><label><span className="sr-only">종목 검색</span><input type="search" placeholder="종목명, 티커 검색" value={query} onChange={(event) => setQuery(event.target.value)}/></label></div></div><p className="footnote">기준: {priceAt} · 일부 종목 예시로 상단 요약과 합산되지 않습니다. 해외 종목 가격은 USD, 평가금액은 KRW.</p>
    <div className="table-scroll desktop-holdings"><table><thead><tr><th>종목명</th><th>티커</th><th>계좌</th><th>보유수량</th><th>평균매입가</th><th>현재가</th><th>평가금액 (원)</th><th>수익률</th><th>목표비중</th><th>현재비중</th></tr></thead><tbody>{visible.map((holding) => <tr key={holding.ticker}><td><button className="text-button holding-name" onClick={() => setSelected(holding)}><span className={`asset-icon ${holding.color}`} aria-hidden="true">{holding.name.slice(0,1)}</span>{holding.name}</button></td><td>{holding.ticker}</td><td>{holding.account}</td><td>{holding.quantity}</td><td>{holding.category === "해외 주식" ? "$" : "₩"}{formatDecimal(holding.average)}</td><td>{holding.category === "해외 주식" ? "$" : "₩"}{formatDecimal(holding.price)}</td><td>{formatDecimal(holding.valuation)}</td><td className="positive">{holding.returnRate}%</td><td>{holding.target}%</td><td>{holding.weight}%</td></tr>)}</tbody></table></div>
    <div className="mobile-holdings">{visible.map((holding) => <button key={holding.ticker} className="holding-mobile-row" onClick={() => setSelected(holding)}><span className={`asset-icon ${holding.color}`} aria-hidden="true">{holding.name.slice(0,1)}</span><span><b>{holding.name}</b><small>{won(holding.valuation)}</small></span><strong className="positive">{holding.returnRate}% ›</strong></button>)}</div>{!visible.length && <p className="empty-inline" role="status">조건에 맞는 보유 종목이 없습니다.</p>}{selected && <HoldingDetail holding={selected} onClose={() => setSelected(null)}/>}
  </section>;
}

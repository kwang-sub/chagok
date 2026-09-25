"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { DemoNotice, Donut, Kpi, Panel, StairIllustration, TrendChart } from "../../components/finance-ui";
import { StatePreview } from "../../components/state-preview";
import { formatDecimal, won } from "../../lib/format-finance";

const cards = [
  { name: "신한카드 Deep Dream", owner: "구성원 A", spent: "420000", target: "500000", gap: "80000", rate: 84, day: "06.10", tone: "green" },
  { name: "삼성카드 taptap O", owner: "구성원 B", spent: "320000", target: "500000", gap: "180000", rate: 64, day: "06.15", tone: "purple" },
  { name: "현대카드 M Edition3", owner: "구성원 A", spent: "150000", target: "300000", gap: "150000", rate: 50, day: "06.08", tone: "gold" },
  { name: "국민카드 Easy 생활", owner: "공동", spent: "80000", target: "200000", gap: "120000", rate: 40, day: "06.20", tone: "blue" },
];
const expenses = [
  { label: "식비", amount: "720000", value: "25", color: "#f5b448" }, { label: "생활", amount: "480000", value: "17", color: "#70c489" },
  { label: "교통", amount: "310000", value: "11", color: "#4c8cea" }, { label: "여가/문화", amount: "360000", value: "13", color: "#a18bdc" },
  { label: "기타", amount: "960400", value: "34", color: "#d8dce2" },
];
function CardCarousel({ scope }: { scope: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const visible = cards.filter((card) => scope === "가계 전체" || card.owner === scope || card.owner === "공동");
  return <Panel title="카드 실적 현황" href="/preview/cards" className="card-performance"><div className="carousel-actions"><button aria-label="이전 카드" onClick={() => ref.current?.scrollBy({ left: -260, behavior: "smooth" })}>‹</button><button aria-label="다음 카드" onClick={() => ref.current?.scrollBy({ left: 260, behavior: "smooth" })}>›</button></div><div className="card-carousel" ref={ref} tabIndex={0} aria-label="카드 실적, 좌우 스크롤 가능">{visible.map((card) => <article className={`payment-card ${card.tone}`} key={card.name}><div className="payment-title"><span className={`asset-icon ${card.tone}`} aria-hidden="true">▥</span><div>{card.name}<small>{card.owner}</small></div></div><span className="small">실적</span><div className="spread"><span className="small">{formatDecimal(card.spent)}원 / {formatDecimal(card.target)}원</span><strong>{card.rate}%</strong></div><progress value={card.rate} max={100} aria-label={`${card.name} 실적 달성률`}/><div className="spread small"><span>부족 금액<br/><b>{formatDecimal(card.gap)}원</b></span><span>결제일<br/><b>{card.day}</b></span></div></article>)}</div><p className="footnote">* 카드 실적은 예시이며 카드사 정책에 따라 실제 실적과 차이가 있을 수 있습니다.</p></Panel>;
}
function CashFlow() {
  return <Panel title="이번 달 현금흐름" href="/preview/cash-flow"><div className="cash-flow"><div className="cash-donut"><Donut label="총 수입" value="5,200,000원" segments={[{ label: "지출", value: "54.4", color: "#fa858b" }, { label: "투자", value: "23.1", color: "#8baaf0" }, { label: "잔여", value: "22.5", color: "#63bd84" }]}/></div><div className="flow-values">{[{ label: "수입", amount: "5200000", width: "100%", color: "#1c9a78" }, { label: "지출", amount: "2830400", width: "54.4%", color: "#f17c84" }, { label: "투자", amount: "1200000", width: "23.1%", color: "#568ce9" }].map((item) => <div className="flow-row" key={item.label}><span>{item.label}</span><span className="flow-bar" style={{ width: item.width, background: item.color }}/><strong>{formatDecimal(item.amount)}원</strong></div>)}<div className="balance spread"><span>잔여</span><strong>1,169,600원</strong></div></div></div></Panel>;
}
export function Dashboard() {
  const [scope, setScope] = useState("가계 전체");
  const household = scope === "가계 전체";
  return <><header className="page-header"><div><h1>안녕하세요, 차곡님!</h1><p>우리 가계의 자산 현황을 한눈에 확인해 보세요.</p></div><label className="scope-select"><span className="sr-only">가계/구성원 조회 범위</span><select value={scope} onChange={(event) => setScope(event.target.value)}><option>가계 전체</option><option>구성원 A</option><option>구성원 B</option></select></label></header><DemoNotice/><StatePreview dashboard>
    {!household && <p className="warning" role="status">{scope}의 카드만 표시합니다. 구성원별 자산 집계 예시가 없어 아래 요약은 가계 전체 기준입니다.</p>}
    <div className="dashboard-top"><section className="panel hero"><div><span className="eyebrow">순자산 <span className="muted">ⓘ</span></span><strong className="hero-value">{won("328450000")}</strong><p className="positive">▲ 4,280,000 (1.32%) <span className="muted">이번 달</span></p></div><StairIllustration/></section><div className="dashboard-kpis"><Kpi label="총자산" value={won("412250000")} detail="전월 대비 ▲ 2.13%" tone="positive" href="/preview/assets"/><Kpi label="총부채" value={won("83800000")} detail="전월 대비 ▼ 0.85%" tone="negative" href="/preview/debt"/><Kpi label="가용자금" value={won("24800000")} detail="전월 대비 ▲ 5.32%" tone="positive" href="/preview/cash-flow"/></div></div>
    <div className="dashboard-grid"><Panel title="순자산 추이 (지난달 ↔ 이번달)" href="/preview/net-worth" className="net-worth"><p className="footnote">단위: 원 · 가계 전체</p><TrendChart/></Panel><CashFlow/>
      <Panel title="투자 포트폴리오 요약" href="/investments" className="price-dependent"><div className="summary-pair"><div><span className="eyebrow">평가금액</span><strong>{won("82430000")}</strong></div><div><span className="eyebrow">수익률</span><strong className="positive">+8.42%</strong></div></div><ul className="investment-bars">{[{ name: "TIGER 미국S&P500", amount: "34450000", rate: "41.8", color: "#299c82" },{ name: "TIGER 미국나스닥100", amount: "23150000", rate: "28.1", color: "#658ee6" },{ name: "KODEX 인도Nifty50", amount: "12860000", rate: "15.6", color: "#e8ae51" },{ name: "기타", amount: "11970000", rate: "14.5", color: "#a7b2c8" }].map((item) => <li key={item.name}><span className="dot" style={{ background: item.color }}/><span>{item.name}</span><span className="mini-track"><span style={{ width: `${item.rate}%`, background: item.color }}/></span><span>{item.rate}%</span><strong>{formatDecimal(item.amount)}</strong></li>)}</ul><p className="footnote">* 수익률은 보유자산 기준 · 2025.05.28 예시 스냅샷</p></Panel>
      <Panel title="이번 달 지출 요약" href="/preview/expenses"><div className="summary-pair"><div><span className="eyebrow">총 지출</span><strong>{won("2830400")}</strong></div><div><span className="eyebrow">지난달 대비</span><strong className="positive">▼ 4.21%</strong></div></div><div className="expense-content"><ul className="expense-list">{expenses.map((item) => <li key={item.label}><span className="dot" style={{ background: item.color }}/><span>{item.label}</span><strong>{formatDecimal(item.amount)}</strong><span>{item.value}%</span></li>)}</ul><Donut label="총 지출" value="2,830,400" segments={expenses}/></div></Panel>
    </div><CardCarousel scope={scope}/><p className="footnote">대시보드와 투자 상세는 서로 다른 승인 시안의 독립 예시 스냅샷입니다.</p><Link className="mobile-invest-link" href="/investments">투자 알림과 포트폴리오 확인하기 →</Link>
  </StatePreview></>;
}

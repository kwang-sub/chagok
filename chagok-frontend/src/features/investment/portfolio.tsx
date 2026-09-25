"use client";

import { useState } from "react";
import Link from "next/link";
import { DemoNotice, Donut, Kpi, Panel, StatusBadge, TrendChart } from "../../components/finance-ui";
import { StatePreview } from "../../components/state-preview";
import { won } from "../../lib/format-finance";
import { allocation, fundings, priceAt } from "./fixtures";
import { fundingTypes } from "./view-model";
import { FundingEntry, InvestmentFlow } from "./funding-flow";
import { Holdings } from "./holdings";

export function Portfolio() {
  const [modal, setModal] = useState<"entry" | "invest" | null>(null);
  const [notice, setNotice] = useState("");
  const current = fundings[0];
  return <><header className="page-header"><div><h1>투자 포트폴리오</h1><p>투자금부터 보유 자산까지, 차곡차곡</p></div><button className="primary" onClick={() => setModal("entry")}>＋ 투자금 추가</button></header><DemoNotice/>
    <nav className="tabs" aria-label="투자 화면"><Link href="/investments" aria-current="page">포트폴리오</Link><Link href="/investments/history">투자금 투입</Link><a href="#holdings">계좌별</a><a href="#holdings">종목별</a><a href="#performance">성과 분석</a></nav>
    <StatePreview><div className="portfolio-kpis price-dependent"><Kpi label="총 평가금액" value={won("145320000")} detail="▲ 12,450,000 (9.37%)" tone="positive"/><Kpi label="총 투자원금" value={won("132870000")}/><Kpi label="평가손익" value={won("12450000")} detail="▲ 9.37%" tone="positive"/><Kpi label="연환산 수익률" value="12.8%" detail="기준일: 2025.09.11 · 예시"/></div>
    <div className="funding-notices"><section className="investment-notice"><span className="asset-icon gold" aria-hidden="true">▦</span><div><h2>오늘은 정기 투자일입니다.</h2><p>A계좌에 1,000,000원을 투자할 예정입니다.</p><span className="footnote">알림 예시 · 실제 현재 날짜와 무관합니다.</span></div><div className="button-row"><button className="primary" onClick={() => setModal("invest")}>투자하기</button><button onClick={() => setNotice("보류를 선택했습니다. 예시이며 실제 Funding 상태는 변경되지 않습니다.")}>보류</button><button onClick={() => setNotice("건너뛰기를 선택했습니다. 예시이며 다음 알림 일정은 변경하지 않습니다.")}>건너뛰기</button></div></section><button className="additional-notice" onClick={() => setModal("entry")}><span className="asset-icon blue" aria-hidden="true">＋</span><span><b>추가 납입하기</b><small>원하는 금액을 별도 투자금으로</small></span></button></div>{notice && <p className="warning" role="status">{notice} <button onClick={() => setNotice("")} aria-label="알림 닫기">✕</button></p>}
    <div className="portfolio-charts price-dependent"><Panel title="자산 배분 현황 (평가금액 기준)"><Donut label="총 평가금액" value={won("145320000")} segments={allocation}/></Panel><div id="performance"><Panel title="평가금액 및 수익률 추이"><p className="footnote">2024.09 – 2025.09 · 평가금액/원금 예시 · 단순 수익률 +9.37% / 연환산 12.8%</p><TrendChart investment/></Panel></div></div>
    <p className="footnote price-dependent">가격 조회일시: {priceAt} · 실시간 시세가 아닙니다.</p><div id="holdings" className="price-dependent"><Holdings/></div>
    <div className="funding-bottom"><Panel title="최근 투자금 투입 내역" href="/investments/history"><div className="table-scroll"><table><thead><tr><th>일자</th><th>유형</th><th>계좌</th><th>금액</th><th>상태</th></tr></thead><tbody>{fundings.slice(0,4).map((item) => <tr key={item.id}><td><Link className="subtle-link" href={`/investments/history?funding=${item.id}`}>{item.date}</Link></td><td>{fundingTypes[item.type]}</td><td>{item.account}</td><td>{won(item.amount)}</td><td><StatusBadge status={item.status}/></td></tr>)}</tbody></table></div></Panel><Panel title="다음 예정 투자금"><div className="scheduled-cards"><article><span className="asset-icon blue" aria-hidden="true">▦</span><p>정기 투자<br/><b>2025.09.25 (목)</b><br/>A계좌</p><strong>{won("1000000")}</strong><StatusBadge status="SCHEDULED"/></article><article><span className="asset-icon green" aria-hidden="true">▦</span><p>추가 납입 (예정)<br/><b>2025.10.10 (금)</b><br/>ISA계좌</p><strong>{won("500000")}</strong><StatusBadge status="SCHEDULED"/></article></div></Panel></div>
    </StatePreview>{modal === "entry" && <FundingEntry onClose={() => setModal(null)}/>} {modal === "invest" && current && <InvestmentFlow funding={current} onClose={() => setModal(null)}/>}
  </>;
}

"use client";

import { useState } from "react";
import { Drawer } from "../../components/drawer";
import { DemoNotice, StatusBadge } from "../../components/finance-ui";
import { formatDecimal, won } from "../../lib/format-finance";
import { fundingTypes, type Funding, type FundingType } from "./view-model";
import { accounts } from "./fixtures";

export function FundingComparison({ funding }: { funding: Funding }) {
  return <><h3>매수/매도 제안 <span className="muted small">생성 시점 스냅샷</span></h3><p className="footnote">가격 기준: {funding.priceAt} · 아래 항목은 일부 종목의 표시 예시입니다.</p>{funding.suggestions.length ? <div className="table-scroll"><table><caption className="sr-only">제안 결과, 실제 주문이 아닙니다</caption><thead><tr><th>종목명</th><th>구분</th><th>목표비중</th><th>제안 금액</th><th>예상수량</th><th>상태</th></tr></thead><tbody>{funding.suggestions.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.side === "BUY" ? "매수" : "매도"}</td><td>{item.target}%</td><td>{formatDecimal(item.amount)}원</td><td>{item.quantity}주</td><td>{{ PENDING: "제안 대기", BUY_COMPLETED: "매수 완료", SELL_COMPLETED: "매도 완료", SKIPPED: "건너뜀" }[item.status]}</td></tr>)}</tbody></table></div> : <p className="empty-inline">등록된 제안 예시가 없습니다.</p>}
    <h3>실행 결과 <span className="positive small">실제 체결 내역과 별도 구분</span></h3>{funding.executions.length ? <div className="table-scroll"><table><caption className="sr-only">완료된 실행 결과 예시</caption><thead><tr><th>종목명</th><th>구분</th><th>체결금액</th><th>체결수량</th><th>수수료</th></tr></thead><tbody>{funding.executions.map((item) => <tr key={item.name}><td>{item.name}</td><td>{item.side === "BUY" ? "매수" : "매도"}</td><td>{formatDecimal(item.amount)}원</td><td>{item.quantity}주</td><td>{formatDecimal(item.fee)}원</td></tr>)}</tbody></table></div> : <p className="empty-inline">실행 결과가 없습니다. 제안을 실행 결과로 간주하지 않습니다.</p>}
  </>;
}
export function FundingEntry({ onClose, source, initialType = "ADDITIONAL" }: { onClose: () => void; source?: Funding; initialType?: FundingType }) {
  const [type, setType] = useState(source?.type ?? initialType);
  const [confirmed, setConfirmed] = useState(false);
  return <Drawer title={source ? "복사하여 새 투자금 등록 · 예시" : "투자금 추가 · 예시"} onClose={onClose}><DemoNotice/><form className="funding-form" onSubmit={(event) => { event.preventDefault(); setConfirmed(true); }}>
    <label>투자 유형<select value={type} onChange={(event) => { const value = event.target.value; if (value === "REGULAR" || value === "ADDITIONAL" || value === "ONE_OFF") setType(value); setConfirmed(false); }}>{Object.entries(fundingTypes).map(([key,label]) => <option key={key} value={key}>{label}</option>)}</select></label>
    <label>계좌<select defaultValue={source?.account ?? accounts[0]} onChange={() => setConfirmed(false)}>{accounts.map((account) => <option key={account}>{account}</option>)}</select></label>
    <label>투자금 (원)<input inputMode="numeric" pattern="[1-9][0-9]*" required defaultValue={source?.amount ?? "1000000"} onChange={() => setConfirmed(false)}/><span className="footnote">반올림하지 않는 정수 원 단위</span></label>
    <label>투자일<input type="date" required defaultValue={source?.date ?? "2025-09-25"} onChange={() => setConfirmed(false)}/></label>
    <label>메모<input maxLength={100} defaultValue={source?.memo ?? ""} onChange={() => setConfirmed(false)}/></label>
    <button className="primary" type="submit">입력 확인 (저장 안 됨)</button>{confirmed && <p className="success-notice" role="status">입력 형식을 확인했습니다. 서버 계약 미확정으로 투자금을 생성하거나 저장하지 않았습니다.</p>}
  </form></Drawer>;
}
export function InvestmentFlow({ funding, onClose }: { funding: Funding; onClose: () => void }) {
  const [step, setStep] = useState<"confirm" | "suggestion" | "result">("confirm");
  const [notice, setNotice] = useState("");
  return <Drawer title="투자하기 · UI 미리보기" onClose={onClose}><DemoNotice/><div className="steps" aria-label="투자 진행 단계"><span aria-current={step === "confirm" ? "step" : undefined}>1 금액 확인</span><span aria-current={step === "suggestion" ? "step" : undefined}>2 제안 확인</span><span aria-current={step === "result" ? "step" : undefined}>3 실행 안내</span></div><div className="funding-highlight"><span className="badge">{fundingTypes[funding.type]}</span><h3>{funding.date}</h3><p>{funding.account}</p><strong className="large-number">{won(funding.amount)}</strong><p>{funding.memo}</p><StatusBadge status={funding.status}/></div>
    {step === "confirm" && <><p>이 투자금의 제안 예시를 확인하시겠습니까?</p><div className="button-row"><button className="primary" onClick={() => setStep("suggestion")}>투자 제안 보기</button><button onClick={() => setNotice("보류 UI를 선택했습니다. 실제 상태는 변경하지 않았습니다.")}>보류</button><button onClick={() => setNotice("건너뛰기 UI를 선택했습니다. 실제 상태는 변경하지 않았습니다.")}>건너뛰기</button></div></>}
    {step === "suggestion" && <><FundingComparison funding={funding}/><p className="warning">계산된 추천이나 주문이 아닌 고정 예시입니다. 실제 투자 시뮬레이션은 아직 연결되지 않았습니다.</p><div className="button-row"><button onClick={() => setStep("confirm")}>이전</button><button className="primary" onClick={() => setStep("result")}>제안 확인 후 실행 안내</button></div></>}
    {step === "result" && <section className="empty-state" role="status"><h3>실제 주문은 실행되지 않았습니다</h3><p>증권사 주문 및 완료 상태 반영은 서버 계약 확정 후 연결됩니다. 예시 보유수량과 내역은 변경하지 않았습니다.</p><button onClick={onClose}>포트폴리오로 돌아가기</button></section>}
    {notice && <p className="warning" role="status">{notice}</p>}
  </Drawer>;
}

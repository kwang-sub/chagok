import type { ReactNode } from "react";
import Link from "next/link";
import { fundingStatuses, type FundingStatus } from "../features/investment/view-model";

export function Panel({ title, href, children, className = "" }: { title: string; href?: string; children: ReactNode; className?: string }) {
  return <section className={`panel ${className}`}><div className="panel-heading"><h2>{title}</h2>{href && <Link className="subtle-link" href={href}>더보기 <span aria-hidden="true">›</span><span className="sr-only"> {title}</span></Link>}</div>{children}</section>;
}
export function Kpi({ label, value, detail, tone = "", href }: { label: string; value: string; detail?: string; tone?: string; href?: string }) {
  const content = <><span className="eyebrow">{label}</span><strong className="kpi-value">{value}</strong>{detail && <span className={`small ${tone}`}>{detail}</span>}</>;
  return href ? <Link className="panel kpi" href={href}>{content}</Link> : <div className="panel kpi">{content}</div>;
}
export function StatusBadge({ status }: { status: FundingStatus }) { return <span className={`badge status-${status}`}>{fundingStatuses[status]}</span>; }
export function DemoNotice() { return <p className="demo-notice">UI 예시 데이터 · 실제 계좌와 연결되지 않으며 주문·저장되지 않습니다.</p>; }
export function TrendChart({ investment = false }: { investment?: boolean }) {
  const labels = investment ? ["2024.09", "2024.12", "2025.03", "2025.06", "2025.09"] : ["지난달", "이번달"];
  return <figure className="chart"><svg viewBox="0 0 540 200" role="img" aria-label={investment ? "예시 추이: 평가금액과 투자원금이 기간 중 증가. 수익률 계산이 아닌 고정 시각화." : "순자산: 지난달 324,170,000원에서 이번달 328,450,000원으로 증가"}>
    <defs><linearGradient id={investment ? "investment-fill" : "wealth-fill"} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#1f9a79" stopOpacity=".2"/><stop offset="100%" stopColor="#1f9a79" stopOpacity="0"/></linearGradient></defs>
    {[30, 70, 110, 150].map((y) => <line key={y} x1="45" y1={y} x2="525" y2={y} stroke="#edf0f2"/>)}
    <text x="0" y="33">{investment ? "평가액" : "340M"}</text><text x="0" y="113">{investment ? "원금" : "320M"}</text>
    <path d="M55 145 L150 123 L245 114 L340 91 L430 76 L520 43 L520 170 L55 170Z" fill={`url(#${investment ? "investment-fill" : "wealth-fill"})`}/>
    <polyline points="55,145 150,123 245,114 340,91 430,76 520,43" fill="none" stroke={investment ? "#4c8cea" : "#168567"} strokeWidth="3"/>
    {[[55,145],[150,123],[245,114],[340,91],[430,76],[520,43]].map(([x,y]) => <circle key={x} cx={x} cy={y} r="4" fill={investment ? "#4c8cea" : "#168567"}/>)}
    {investment && <polyline points="55,159 150,144 245,127 340,116 430,103 520,83" fill="none" stroke="#1f9a79" strokeWidth="3"/>}
    {!investment && <><text x="55" y="131">324,170,000</text><text x="425" y="28" fill="#168567">328,450,000</text></>}
  </svg><figcaption><div className="chart-axis">{labels.map((label) => <span key={label}>{label}</span>)}</div>{investment && <p className="chart-legend"><span>🔵 평가금액</span><span>🟢 투자원금</span><span>고정 예시 · 수익률 계산 없음</span></p>}</figcaption></figure>;
}
export function Donut({ label, value, segments }: { label: string; value: string; segments: readonly { label: string; value: string; color: string }[] }) {
  const gradient = segments.reduce<{ offset: number; stops: string[] }>((result, segment) => {
    const end = result.offset + Number(segment.value);
    return { offset: end, stops: [...result.stops, `${segment.color} ${result.offset}% ${end}%`] };
  }, { offset: 0, stops: [] }).stops.join(", ");
  return <div className="donut-layout"><div className="donut" role="img" aria-label={`${label} ${value}. ${segments.map((s) => `${s.label} ${s.value}%`).join(", ")}`} style={{ background: `conic-gradient(${gradient})` }}><div><span>{label}</span><strong>{value}</strong></div></div><ul className="legend">{segments.map((item) => <li key={item.label}><span className="dot" style={{ background: item.color }}/><span>{item.label}</span><strong>{item.value}%</strong></li>)}</ul></div>;
}
export function StairIllustration() {
  return <svg className="stair-art" viewBox="0 0 210 180" aria-hidden="true"><ellipse cx="112" cy="166" rx="86" ry="9" fill="#d8eee5"/><path d="M22 148L64 124L105 145L62 170Z" fill="#25c5a3"/><path d="M62 170V143L104 120V146Z" fill="#078c76"/><path d="M63 121L105 98L145 120L103 145Z" fill="#32d1b0"/><path d="M103 145V119L145 95V121Z" fill="#079b80"/><path d="M104 93L145 69L185 92L144 116Z" fill="#3bdbbc"/><path d="M144 116V89L185 66V93Z" fill="#078e78"/><path d="M123 49L149 34L174 49L149 64Z" fill="#7ae2c5"/><path d="M123 49V78L149 93V64Z" fill="#30bfa0"/><path d="M149 64V93L174 78V49Z" fill="#0b9e83"/><path d="M148 43V11" stroke="#168567" strokeWidth="3"/><ellipse cx="138" cy="17" rx="11" ry="6" transform="rotate(35 138 17)" fill="#22b488"/><ellipse cx="158" cy="10" rx="11" ry="6" transform="rotate(-35 158 10)" fill="#168567"/><circle cx="68" cy="123" r="15" fill="#ffc644" stroke="#e4a32c" strokeWidth="3"/><text x="60" y="129" fill="#b77911" fontSize="17">₩</text></svg>;
}

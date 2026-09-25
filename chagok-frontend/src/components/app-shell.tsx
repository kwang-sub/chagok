"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  { label: "홈", icon: "⌂", href: "/" },
  { label: "자산", icon: "▣", href: "/preview/assets" },
  { label: "투자", icon: "↗", href: "/investments" },
  { label: "지출", icon: "▤", href: "/preview/expenses" },
  { label: "현금흐름", icon: "⇄", href: "/preview/cash-flow" },
  { label: "부채", icon: "▱", href: "/preview/debt" },
  { label: "보고서", icon: "▧", href: "/preview/reports" },
  { label: "계좌·카드", icon: "▥", href: "/preview/cards" },
  { label: "설정", icon: "⚙", href: "/preview/settings" },
];

export function AppShell({ children }: Readonly<{ children: ReactNode }>) {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const active = (href: string) => pathname === href || (href === "/investments" && pathname.startsWith("/investments/"));
  return <div className="app-shell">
    <a className="skip-link" href="#main">본문으로 이동</a>
    <aside className={`sidebar ${expanded ? "is-open" : ""}`}>
      <Link className="brand" href="/"><span aria-hidden="true">♟</span> 차곡</Link>
      <nav aria-label="주 메뉴">{navigation.map((item) => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} onClick={() => setExpanded(false)}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}</nav>
      <div className="sidebar-footer"><div className="household-avatar">차곡 예시 가계</div><p>마지막 업데이트<br/>2025.09.11 09:30 KST</p><span className="badge">UI 미리보기</span></div>
    </aside>
    <div className="mobile-header"><button aria-label="전체 메뉴" aria-expanded={expanded} onClick={() => setExpanded(!expanded)}>☰</button><Link className="brand" href="/">차곡</Link><span className="badge">예시</span></div>
    <main id="main" className="main-content" tabIndex={-1}>{children}</main>
    <nav className="bottom-nav" aria-label="모바일 주요 메뉴">{navigation.slice(0,4).map((item) => <Link key={item.href} href={item.href} aria-current={active(item.href) ? "page" : undefined} onClick={() => setExpanded(false)}><span aria-hidden="true">{item.icon}</span>{item.label}</Link>)}<button onClick={() => setExpanded(!expanded)} aria-expanded={expanded}><span aria-hidden="true">···</span>더보기</button></nav>
  </div>;
}

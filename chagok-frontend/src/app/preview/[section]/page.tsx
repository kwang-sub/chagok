import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";

const sections: Record<string, string> = { assets: "자산", debt: "부채", "net-worth": "순자산 추이", expenses: "지출", "cash-flow": "현금흐름", cards: "계좌·카드 실적", reports: "보고서", settings: "설정" };
export function generateStaticParams() { return Object.keys(sections).map((section) => ({ section })); }
export default async function PreviewPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const title = sections[section];
  if (!title) notFound();
  return <AppShell><section className="panel empty-state"><h1>{title}</h1><p>이 화면은 이번 UI 구현 범위에 포함되지 않았습니다.</p><p>실제 등록·조회 기능은 아직 연결되지 않았습니다.</p><Link className="button primary" href="/">대시보드로 돌아가기</Link></section></AppShell>;
}

import { AppShell } from "@/components/app-shell";
import { History } from "@/features/investment/history";
import { requireSession } from "@/features/auth/session.server";

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ funding?: string | string[] }> }) {
  await requireSession();
  const params = await searchParams;
  return <AppShell><History {...(typeof params.funding === "string" ? { initialFundingId: params.funding } : {})}/></AppShell>;
}

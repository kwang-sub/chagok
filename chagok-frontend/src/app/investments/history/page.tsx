import { AppShell } from "@/components/app-shell";
import { History } from "@/features/investment/history";

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ funding?: string | string[] }> }) {
  const params = await searchParams;
  return <AppShell><History {...(typeof params.funding === "string" ? { initialFundingId: params.funding } : {})}/></AppShell>;
}

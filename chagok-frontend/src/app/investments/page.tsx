import { AppShell } from "@/components/app-shell";
import { Portfolio } from "@/features/investment/portfolio";
import { requireSession } from "@/features/auth/session.server";

export default async function PortfolioPage() {
  await requireSession();
  return <AppShell><Portfolio/></AppShell>;
}

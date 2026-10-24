import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/features/auth/session.server";
import { ResourceList } from "@/features/account-card-management/resource-list";
import { readFilters } from "@/features/account-card-management/model";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSession();
  return <AppShell><ResourceList kind="cards" initialFilters={readFilters(await searchParams)} /></AppShell>;
}

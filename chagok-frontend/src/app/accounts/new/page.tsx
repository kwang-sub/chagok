import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/features/auth/session.server";
import { ResourceForm } from "@/features/account-card-management/resource-form";
import { readFilters } from "@/features/account-card-management/model";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSession();
  return <AppShell><ResourceForm kind="accounts" filters={readFilters(await searchParams)} /></AppShell>;
}

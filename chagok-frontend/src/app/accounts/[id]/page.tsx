import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/features/auth/session.server";
import { ResourceDetail } from "@/features/account-card-management/resource-detail";
import { readFilters } from "@/features/account-card-management/model";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSession();
  const { id } = await params;
  return <AppShell><ResourceDetail kind="accounts" id={id} filters={readFilters(await searchParams)} /></AppShell>;
}

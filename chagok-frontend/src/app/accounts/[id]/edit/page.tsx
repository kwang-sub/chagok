import { AppShell } from "@/components/app-shell";
import { requireSession } from "@/features/auth/session.server";
import { ResourceForm } from "@/features/account-card-management/resource-form";
import { readFilters } from "@/features/account-card-management/model";

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireSession();
  const { id } = await params;
  return <AppShell><ResourceForm kind="accounts" id={id} filters={readFilters(await searchParams)} /></AppShell>;
}

import { AppShell } from "@/components/app-shell";
import { Dashboard } from "@/features/dashboard/dashboard";
import { requireSession } from "@/features/auth/session.server";

export default async function Home() {
  await requireSession();
  return (
    <AppShell>
      <Dashboard />
    </AppShell>
  );
}

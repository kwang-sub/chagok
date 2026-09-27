import { AppShell } from "@/components/app-shell";
import { ProfileForm } from "@/features/auth/profile-form";
import { requireSession } from "@/features/auth/session.server";

export default async function Settings() {
  const { profile } = await requireSession();
  return (
    <AppShell>
      <header className="page-header"><div><h1>설정</h1><p>대시보드에 표시할 이름을 관리하세요.</p></div></header>
      <ProfileForm profile={profile} />
    </AppShell>
  );
}

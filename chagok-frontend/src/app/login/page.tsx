import { AppShell } from "@/components/app-shell";
import { LoginForm } from "@/features/auth/login-form";

export default function LoginPage() {
  return (
    <AppShell>
      <h1>차곡 로그인</h1>
      <p>등록된 계정의 이메일과 비밀번호로 로그인해 주세요.</p>
      <LoginForm />
    </AppShell>
  );
}

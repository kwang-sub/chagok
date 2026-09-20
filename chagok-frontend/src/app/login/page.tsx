import { LoginForm } from "@/features/auth/login-form";
import "@/features/auth/auth.css";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <div className="auth-layout">
        <section className="auth-intro" aria-labelledby="auth-brand-heading">
          <div className="brand"><span aria-hidden="true">♟</span> 차곡</div>
          <p className="eyebrow">우리의 자산을 한눈에</p>
          <h1 id="auth-brand-heading">오늘의 기록이<br />내일의 여유로.</h1>
          <p className="muted">자산부터 투자, 지출까지.<br />차곡과 함께 차근차근 살펴보세요.</p>
        </section>
        <section className="panel auth-panel" aria-labelledby="login-heading">
          <header>
            <h2 id="login-heading">로그인</h2>
            <p className="muted">등록된 계정으로 차곡을 시작해 보세요.</p>
          </header>
          <LoginForm />
          <p className="auth-help muted">등록된 이메일과 비밀번호를 사용해 주세요.</p>
        </section>
      </div>
    </main>
  );
}

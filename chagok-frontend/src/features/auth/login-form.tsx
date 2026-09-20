"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: null });
  return (
    <form action={action} className="auth-form" aria-busy={pending}>
      <div className="auth-field">
        <label htmlFor="email">이메일</label>
        <input id="email" name="email" type="email" autoComplete="username" required maxLength={254}
          placeholder="이메일 주소를 입력해 주세요" aria-describedby={state.error ? "login-error" : undefined} />
      </div>
      <div className="auth-field">
        <label htmlFor="password">비밀번호</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={4096}
          placeholder="비밀번호를 입력해 주세요" aria-describedby={state.error ? "login-error" : undefined} />
      </div>
      {state.error && <p id="login-error" className="auth-error" role="alert">{state.error}</p>}
      <button className="primary" type="submit" disabled={pending}>{pending ? "로그인 중…" : "로그인"}</button>
    </form>
  );
}

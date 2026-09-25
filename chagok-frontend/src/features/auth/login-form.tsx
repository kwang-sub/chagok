"use client";

import { useActionState } from "react";
import { signIn } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(signIn, { error: null });
  return (
    <form action={action} className="auth-form" aria-busy={pending}>
      <label htmlFor="email">이메일</label>
      <input id="email" name="email" type="email" autoComplete="username" required maxLength={254}
        aria-describedby={state.error ? "login-error" : undefined} />
      <label htmlFor="password">비밀번호</label>
      <input id="password" name="password" type="password" autoComplete="current-password" required maxLength={4096}
        aria-describedby={state.error ? "login-error" : undefined} />
      {state.error && <p id="login-error" role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>{pending ? "로그인 중…" : "로그인"}</button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { signOut } from "./actions";

export function SignOutButton() {
  const [state, action, pending] = useActionState(signOut, { error: null });
  return (
    <form action={action} className="auth-form" aria-busy={pending}>
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>{pending ? "로그아웃 중…" : "로그아웃"}</button>
    </form>
  );
}

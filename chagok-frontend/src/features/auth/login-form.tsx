"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";
import { oauthFailureMessage, startGoogleOAuth } from "./oauth";

export function LoginForm({ oauthFailed = false }: { oauthFailed?: boolean }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(oauthFailed ? oauthFailureMessage : null);

  async function signIn() {
    if (pending) return;
    setError(null);
    setPending(true);
    const result = await startGoogleOAuth(() => createClient().auth, window.location.origin);
    if (result.error) {
      setError(result.error);
      setPending(false);
    }
  }

  return (
    <div className="auth-form" aria-busy={pending}>
      {error && <p id="login-error" className="auth-error" role="alert">{error}</p>}
      <button className="primary" type="button" onClick={signIn} disabled={pending}
        aria-describedby={error ? "login-error" : undefined}>
        {pending ? "Google로 이동 중…" : "Google로 계속하기"}
      </button>
      <p role="status" className="muted">{pending ? "Google 로그인 화면으로 이동합니다." : "Google 계정으로 안전하게 로그인하세요."}</p>
    </div>
  );
}

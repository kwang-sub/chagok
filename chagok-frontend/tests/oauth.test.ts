import assert from "node:assert/strict";
import { test } from "node:test";
import { AuthError, type Session, type User } from "@supabase/supabase-js";
import { createBrowserClient, createServerClient } from "@supabase/ssr";

import { exchangeOAuthCode, startGoogleOAuth, oauthFailureMessage, oauthFailurePath } from "@/features/auth/oauth";
import { isPublicAuthPath } from "@/features/auth/routes";


const user: User = { id: "test-user", aud: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-01-01T00:00:00Z" };
const session: Session = { access_token: "test-token", refresh_token: "test-refresh", expires_in: 3600, token_type: "bearer", user };
const origin = "http://localhost:3000";

test("Google initiation uses only a fixed same-origin callback and SDK browser redirect", async () => {
  assert.deepEqual(await startGoogleOAuth(() => ({ signInWithOAuth: async (credentials) => {
    assert.deepEqual(credentials, { provider: "google", options: { redirectTo: origin + "/auth/callback" } });
    return { data: { provider: "google", url: "https://test.invalid/authorize" }, error: null };
  } }), origin), { error: null });
  for (const invalid of ["null", "javascript:alert(1)", "https://user:pass@example.invalid", origin + "/other", origin + "?next=evil"]) {
    let calls = 0;
    assert.deepEqual(await startGoogleOAuth(() => { calls++; throw new Error("must not create"); }, invalid), { error: oauthFailureMessage });
    assert.equal(calls, 0);
  }
});

test("Google initiation generalizes SDK, configuration and thrown failures", async () => {
  assert.deepEqual(await startGoogleOAuth(() => ({ signInWithOAuth: async () => ({ data: { provider: "google", url: null }, error: new AuthError("private detail") }) }), origin), { error: oauthFailureMessage });
  assert.deepEqual(await startGoogleOAuth(() => ({ signInWithOAuth: async () => { throw new Error("private detail"); } }), origin), { error: oauthFailureMessage });
  assert.deepEqual(await startGoogleOAuth(() => { throw new Error("configuration"); }, origin), { error: oauthFailureMessage });
});

test("callback rejects missing, blank, duplicate, oversized codes and provider errors before creating auth", async () => {
  for (const query of ["", "code=", "code=%20", "code=a&code=b", "code=a&code=a", "code=" + "a".repeat(4097), "error=access_denied", "code=a&error=access_denied"]) {
    let calls = 0;
    assert.equal(await exchangeOAuthCode(async () => { calls++; throw new Error("must not create"); }, new URLSearchParams(query)), oauthFailurePath);
    assert.equal(calls, 0);
  }
});

test("callback exchanges exactly the supplied code and ignores arbitrary destinations", async () => {
  assert.equal(await exchangeOAuthCode(async () => ({ exchangeCodeForSession: async (code) => {
    assert.equal(code, "test-code");
    return { data: { user, session, redirectType: null }, error: null };
  } }), new URLSearchParams("code=test-code&next=https://evil.invalid&error_description=private")), "/");
});

test("callback failures and absent sessions share generic guidance without code leakage", async () => {
  const params = new URLSearchParams("code=test-code");
  for (const detail of ["invalid", "expired", "reused"]) {
    assert.equal(await exchangeOAuthCode(async () => ({ exchangeCodeForSession: async () => ({ data: { user: null, session: null, redirectType: null }, error: new AuthError(detail) }) }), params), oauthFailurePath);
  }

  assert.equal(await exchangeOAuthCode(async () => ({ exchangeCodeForSession: async () => { throw new Error("private detail"); } }), params), oauthFailurePath);
  assert.equal(await exchangeOAuthCode(async () => { throw new Error("configuration"); }, params), oauthFailurePath);
});

test("real browser PKCE cookies feed SSR exchange, persist session, and clear on local sign-out", async () => {
  const jar = new Map<string, string>();
  const cookies = {
    getAll: () => Array.from(jar, ([name, value]) => ({ name, value })),
    setAll: (values: { name: string; value: string }[]) => values.forEach(({ name, value }) => { if (value) jar.set(name, value); else jar.delete(name); }),
  };
  const browser = createBrowserClient("https://test.invalid", "sb_publishable_test", { cookies, isSingleton: false });
  assert.deepEqual(await startGoogleOAuth(() => ({ signInWithOAuth: async (credentials) => {
    const result = await browser.auth.signInWithOAuth(credentials);
    assert.ok(result.data.url);
    const url = new URL(result.data.url);
    assert.equal(url.searchParams.get("provider"), "google");
    assert.equal(url.searchParams.get("redirect_to"), origin + "/auth/callback");
    assert.equal(url.searchParams.get("code_challenge_method"), "s256");
    assert.ok(url.searchParams.get("code_challenge"));
    return result;
  } }), origin), { error: null });
  assert.ok(Array.from(jar.keys()).some((key) => key.includes("code-verifier")));
  const server = createServerClient("https://test.invalid", "sb_publishable_test", {
    cookies,
    global: { fetch: async (input, init) => {
      const url = new URL(String(input));
      if (url.pathname.endsWith("/logout")) {
        assert.equal(url.searchParams.get("scope"), "local");
        return new Response(null, { status: 204 });
      }
      assert.equal(url.pathname, "/auth/v1/token");
      assert.equal(url.searchParams.get("grant_type"), "pkce");
      const body = JSON.parse(String(init?.body));
      assert.equal(body.auth_code, "test-code");
      assert.equal(typeof body.code_verifier, "string");
      assert.ok(body.code_verifier.length > 0);
      return Response.json(session);
    } },
  });
  assert.equal(await exchangeOAuthCode(async () => server.auth, new URLSearchParams("code=test-code")), "/");
  assert.ok(jar.get("sb-test-auth-token"));
  assert.equal((await server.auth.signOut({ scope: "local" })).error, null);
  assert.equal(jar.has("sb-test-auth-token"), false);
});

test("real SSR rejects callback without the browser PKCE verifier", async () => {
  let calls = 0;
  const server = createServerClient("https://test.invalid", "sb_publishable_test", {
    cookies: { getAll: () => [], setAll: () => {} },
    global: { fetch: async () => { calls++; throw new Error("must not fetch"); } },
  });
  assert.equal(await exchangeOAuthCode(async () => server.auth, new URLSearchParams("code=test-code")), oauthFailurePath);
  assert.equal(calls, 0);
});

test("anonymous route policy allows only exact Google auth routes", () => {
  for (const path of ["/login", "/auth/callback"]) assert.equal(isPublicAuthPath(path), true);
  for (const path of ["/", "/investments", "/signup", "/auth/confirm", "/login/private", "/auth/callback/other"]) assert.equal(isPublicAuthPath(path), false);
});



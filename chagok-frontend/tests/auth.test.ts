import assert from "node:assert/strict";
import { test } from "node:test";
import { AuthError, type Session, type User } from "@supabase/supabase-js";
import { getSupabaseConfig } from "../src/lib/supabase/config";
import { signInWithForm } from "../src/features/auth/credentials";
import { getVerifiedSession } from "../src/features/auth/session";
import { createHttpClient, ApiHttpError } from "../src/lib/api/http-client";

const user: User = { id: "validated-user", app_metadata: {}, user_metadata: {}, aud: "authenticated", created_at: "2026-01-01T00:00:00Z" };
const session: Session = { access_token: "test-access-token", refresh_token: "test-refresh-token", token_type: "bearer", expires_in: 300, user };

test("configuration rejects missing and privileged keys without leaking values", () => {
  assert.deepEqual(getSupabaseConfig("https://test.invalid", "sb_publishable_test"), { url: "https://test.invalid", key: "sb_publishable_test" });
  for (const key of ["", "sb_secret_test", "legacy-jwt", "service_role"]) {
    assert.throws(() => getSupabaseConfig("https://test.invalid", key), /must be configured/);
  }
  assert.throws(() => getSupabaseConfig("https://user:password@test.invalid", "sb_publishable_test"), /HTTP\(S\) origin/);
});

test("login validates input without an auth call and passes valid password unchanged", async () => {
  const form = new FormData();
  const invalid = await signInWithForm({ signInWithPassword: async () => { throw new Error("must not call"); } }, form);
  assert.ok(invalid.error);
  form.set("email", " test@example.invalid ");
  form.set("password", " test-password ");
  const result = await signInWithForm({ signInWithPassword: async (credentials) => {
    assert.deepEqual(credentials, { email: "test@example.invalid", password: " test-password " });
    return { data: { user, session }, error: null };
  } }, form);
  assert.equal(result.error, null);
  const failed = await signInWithForm({ signInWithPassword: async () => ({ data: { user: null, session: null }, error: new AuthError("private upstream detail") }) }, form);
  assert.ok(failed.error);
  assert.ok(!failed.error.includes("private upstream"));
});

test("session is never authorized from cookie user data alone", async () => {
  await assert.rejects(getVerifiedSession({
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => { throw new Error("must not call"); },
  }), (error: unknown) => error instanceof ApiHttpError && error.status === 401);
  await assert.rejects(getVerifiedSession({
    getSession: async () => ({ data: { session }, error: null }),
    getUser: async () => ({ data: { user: null }, error: new AuthError("invalid") }),
  }), (error: unknown) => error instanceof ApiHttpError && error.status === 401);
  const verified = await getVerifiedSession({
    getSession: async () => ({ data: { session: { ...session, user: { ...user, id: "forged-cookie-user" } } }, error: null }),
    getUser: async (token) => {
      assert.equal(token, session.access_token);
      return { data: { user }, error: null };
    },
  });
  assert.deepEqual(verified, { accessToken: session.access_token, userId: user.id });
});

test("backend transport forwards bearer only to configured origin with no caching or redirects", async () => {
  let calls = 0;
  const request = createHttpClient("https://backend.invalid", async (_input, init) => {
    calls++;
    assert.equal(new Headers(init?.headers).get("Authorization"), "Bearer test-access-token");
    assert.equal(init?.cache, "no-store");
    assert.equal(init?.redirect, "error");
    return Response.json({ ok: true });
  }, session.access_token);
  await request("/api/poc/etfs");
  await assert.rejects(request("https://other.invalid/api"), /configured origin/);
  assert.equal(calls, 1);
});

test("401 and 403 backend statuses remain distinct and do not expose response bodies", async () => {
  for (const status of [401, 403]) {
    const request = createHttpClient("https://backend.invalid", async () => new Response("private", { status }), session.access_token);
    await assert.rejects(request("/api/poc/etfs"), (error: unknown) => error instanceof ApiHttpError && error.status === status && !error.message.includes("private"));
  }
});

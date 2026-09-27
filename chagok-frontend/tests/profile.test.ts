import assert from "node:assert/strict";
import { test } from "node:test";
import { AuthError, type Session, type User } from "@supabase/supabase-js";
import { toUserProfile, validateDisplayName } from "@/features/auth/profile";
import { getVerifiedSession } from "@/features/auth/session";
import { updateDisplayName } from "@/features/auth/profile-update";

const user: User = { id: "verified-profile-user", email: "member@example.invalid", app_metadata: {}, user_metadata: { full_name: "Google 이름" }, aud: "authenticated", created_at: "2026-01-01T00:00:00Z" };
const session: Session = { access_token: "test-profile-token", refresh_token: "test-refresh", expires_in: 300, token_type: "bearer", user };
const verifiedAuth = {
  getSession: async () => ({ data: { session }, error: null }),
  getUser: async () => ({ data: { user }, error: null }),
};

test("profile selects trimmed display name, Google fallbacks, email then generic name", () => {
  assert.deepEqual(toUserProfile({ ...user, user_metadata: { display_name: "  앱 이름  ", full_name: "Google 이름" } }), { displayName: "앱 이름", email: user.email });
  assert.equal(toUserProfile(user).displayName, "Google 이름");
  assert.equal(toUserProfile({ ...user, user_metadata: { display_name: {}, full_name: 7, name: " 이름 " } }).displayName, "이름");
  assert.equal(toUserProfile({ ...user, user_metadata: { display_name: " ", full_name: "x".repeat(51) } }).displayName, "member");
  assert.deepEqual(toUserProfile({ user_metadata: {} }), { displayName: "사용자", email: "" });
});

test("display name rejects blank, non-string and over-limit input and normalizes boundaries", () => {
  for (const value of ["", " \t\n ", null, undefined, 0, {}, "가".repeat(51)]) assert.ok(validateDisplayName(value).error);
  assert.deepEqual(validateDisplayName("  이름  "), { value: "이름", error: null });
  assert.equal(validateDisplayName("가".repeat(50)).error, null);
});

test("profile reads only remotely verified metadata and exposes no token in profile", async () => {
  const result = await getVerifiedSession({
    ...verifiedAuth,
    getSession: async () => ({ data: { session: { ...session, user: { ...user, email: "forged@example.invalid", user_metadata: { display_name: "forged" } } } }, error: null }),
  });
  assert.deepEqual(result.profile, { displayName: "Google 이름", email: "member@example.invalid" });
  assert.deepEqual(Object.keys(result.profile).sort(), ["displayName", "email"]);
});

test("update verifies identity before writing only normalized display_name", async () => {
  const calls: string[] = [];
  const result = await updateDisplayName({
    ...verifiedAuth,
    getUser: async (token) => { assert.equal(token, session.access_token); calls.push("verify"); return { data: { user }, error: null }; },
    updateUser: async (attributes) => {
      calls.push("write");
      assert.deepEqual(attributes, { data: { display_name: "새 이름" } });
      return { data: { user: { ...user, user_metadata: { ...user.user_metadata, ...attributes.data } } }, error: null };
    },
  }, "  새 이름  ");
  assert.deepEqual(calls, ["verify", "write"]);
  assert.equal(result.status, "success");
  assert.equal(result.displayName, "새 이름");
});

test("invalid names and unverified sessions cannot update metadata", async () => {
  const updateUser = async () => { assert.fail("must not update"); };
  for (const value of ["", "  ", "x".repeat(51), new Blob(["name"])]) {
    const result = await updateDisplayName({ ...verifiedAuth, updateUser }, value);
    assert.equal(result.status, "error");
    assert.ok(result.fieldError);
  }
  for (const auth of [
    { ...verifiedAuth, getSession: async () => ({ data: { session: null }, error: null }) },
    { ...verifiedAuth, getUser: async () => ({ data: { user: null }, error: new AuthError("private-auth-detail") }) },
    { ...verifiedAuth, getUser: async () => { throw new Error("private-network-detail"); } },
  ]) {
    const result = await updateDisplayName({ ...auth, updateUser }, "새 이름");
    assert.equal(result.status, "error");
    assert.doesNotMatch(result.message, /private-/);
  }
});

test("SDK errors, missing users, mismatched identities and thrown failures stay generic", async () => {
  const responses = [
    { data: { user: null }, error: new AuthError("private-update-detail") },
    { data: { user: { ...user, id: "another-user" } }, error: null },
  ];
  for (const response of responses) {
    const result = await updateDisplayName({ ...verifiedAuth, updateUser: async () => response }, "새 이름");
    assert.equal(result.status, "error");
    assert.doesNotMatch(result.message, /private-/);
  }
  assert.equal((await updateDisplayName({ ...verifiedAuth, updateUser: async () => { throw new Error("private-detail"); } }, "새 이름")).status, "error");
});

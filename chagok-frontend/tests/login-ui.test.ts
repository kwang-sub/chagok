import assert from "node:assert/strict";
import { test } from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { LoginForm } from "@/features/auth/login-form";
import { oauthFailureMessage } from "@/features/auth/oauth";

test("Google-only login renders an accessible button without credential or signup fields", () => {
  const html = renderToStaticMarkup(createElement(LoginForm));
  assert.match(html, /type="button"/);
  assert.match(html, /Google로 계속하기/);
  assert.match(html, /aria-busy="false"/);
  assert.match(html, /role="status"/);
  assert.doesNotMatch(html, /<input|<form|password|email|회원가입|role="alert"/);
});

test("callback failure renders only generic accessible feedback linked to the retry button", () => {
  const html = renderToStaticMarkup(createElement(LoginForm, { oauthFailed: true }));
  assert.match(html, /role="alert"/);
  assert.match(html, /aria-describedby="login-error"/);
  assert.ok(html.includes(oauthFailureMessage));
  assert.doesNotMatch(html, /disabled=""/);
});

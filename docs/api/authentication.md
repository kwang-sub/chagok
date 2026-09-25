# Authentication

Status: APPROVED
Documentation Source: APPLICATION_SOURCE
API Spec Mode: SOURCE_SYNC
Approval Source: Kanban t_1bdba456 Google-only requirement delta

## Login and session

Next.js owns Google-only Supabase OAuth login and local sign-out. The login Client Component calls `startGoogleOAuth` with `window.location.origin`; the existing `@supabase/ssr` browser client initiates Google OAuth using PKCE and stores the verifier in cookies. There are no email/password, signup or password-reset controls/actions in the application.

The redirect target is always the same-origin `/auth/callback`. Its GET Route Handler accepts exactly one nonblank code (at most 4096 characters), rejects provider errors, and exchanges the code using a writable per-request SSR client. Session cookies are written through the Next.js cookie store. Successful exchange redirects only to `/`; missing, duplicated, invalid, expired or reused codes and exchange failures redirect only to `/login?oauth=failed`. Arbitrary `next` destinations and provider details are never forwarded or displayed. Callback responses carry `Cache-Control: private, no-store, max-age=0` and `Referrer-Policy: no-referrer`.

Only `/login` and `/auth/callback` are public auth routes; their subpaths are not public. The proxy covers application routes (excluding Next static/image resources and favicon), refreshes session cookies on the request/response boundary and marks responses as non-cacheable, including redirects and `Set-Cookie` responses. Logout remains a same-origin Server Action ending the local Supabase session.

Server Components and Server Actions create the Supabase client from the request cookie store. Before forwarding an access token, the server boundary validates the session user with Supabase `getUser(accessToken)`; `getSession()` cookie data alone is not an identity assertion. Access tokens and Supabase client instances must not be passed to Client Component props.

The browser never calls Spring Boot directly. A Next.js server-only boundary obtains the validated session access token and forwards it in the `Authorization` header using the Bearer scheme. `BACKEND_BASE_URL` is a server runtime setting and must not use the `NEXT_PUBLIC_` prefix. User-specific backend requests use `no-store`; no Next.js API proxy endpoint or browser-to-backend CORS path is added.

## Backend protection

Every `/api/**` request requires a valid Supabase JWT. The backend accepts Bearer credentials only and validates the JWT signature against configured JWKS, issuer, and expiry before the request reaches a protected handler. The configured decoder accepts Supabase asymmetric RS256 and ES256 keys. Only the validated JWT `sub` identifies a user; unsigned claims, unverified cookie data, and client-supplied identity headers are not identity sources.

- Missing, expired or invalid JWT: HTTP 401.
- Authenticated but insufficient authority: HTTP 403.
- No new public error payload is specified; consumers use HTTP status.
- Existing `/api/poc/**` methods, paths and success responses are unchanged.
- No household-role model or user-profile database synchronization is introduced. Authentication is not household-level data authorization.

Existing endpoints covered:

| Method | Path |
| --- | --- |
| GET | `/api/poc/etfs/latest-base-date` |
| GET | `/api/poc/etfs` |
| POST | `/api/poc/etfs/{ticker}/market-price` |

## Environment and compatibility

Frontend public Supabase configuration: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Next.js server-only backend configuration: `BACKEND_BASE_URL`.

Spring Boot resource-server configuration: `SUPABASE_AUTH_ISSUER`, `SUPABASE_JWKS_URI`.

Actual values are entered by the user in local environment configuration and never committed. Example files contain variable names with empty values only. Never use a service_role key or JWT signing secret in the frontend, ordinary backend requests, documentation or examples.

The Supabase project must use asymmetric signing with a matching issuer/JWKS configuration. Previously anonymous PoC callers must now supply a valid access token. No CORS change or browser-to-backend API path is added. Browser-held Supabase session cookies do not authenticate Spring Boot directly.

## Verification boundary

Automated tests use local test fixtures, not production credentials. Real Google/Supabase sign-in, refresh, sign-out and real-project JWT smoke tests remain NOT_RUN until operator configuration is supplied. Supabase project provisioning is out of scope.

## Manual Google setup and smoke checklist

1. Configure a Google Cloud OAuth web client and consent screen. Register the Supabase provider callback URI shown in the Supabase Dashboard as Google's authorized redirect URI (this is not the application's `/auth/callback`).
2. Enable the Google provider in Supabase and enter the Google client credentials only in the Dashboard. Never put the client secret, provider tokens or actual configuration values in source, tests, logs or this document.
3. Register each approved application's exact `/auth/callback` URL in Supabase's redirect allowlist and set its Site URL. Configure only the frontend public Supabase URL/publishable-key variables locally; use HTTPS in production. A deployment reverse proxy must preserve the original Host and HTTPS scheme; the application does not use arbitrary forwarded-host or query destinations for redirects.
4. In a browser, verify Google consent → same-origin callback → `/`, persisted SSR session after reload, protected-page access and local sign-out → `/login`. Verify cancelled consent and invalid/reused callback codes show only generic retry guidance. Check authenticated and callback responses are not cached.
5. Only after this real Google OAuth smoke passes may an operator disable the Email provider in Supabase. This task does not disable providers, migrate/delete existing email accounts, add other providers or use Google API tokens.

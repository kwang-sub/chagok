# Authentication

Status: APPROVED
Documentation Source: DESIGN
API Spec Mode: DESIGN_FIRST
Approval Source: Kanban t_8c30469e approved specification

## Login and session

Next.js owns the Supabase email/password sign-in and sign-out flows. Login and logout are same-origin Next.js Server Actions; logout ends the local Supabase session. Sessions use `@supabase/ssr` cookies. The Next.js proxy refreshes the session on the request/response boundary and marks authenticated HTML, redirects, and `Set-Cookie` responses as non-cacheable.

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

Automated tests use local test fixtures, not production credentials. Real Supabase sign-in, refresh, sign-out and real-project JWT smoke tests remain deferred until local environment values are supplied. Supabase project provisioning is out of scope.

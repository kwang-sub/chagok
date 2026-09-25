# Chagok Frontend

backend와 병렬인 독립 Next.js App Router + React + TypeScript 프로젝트입니다.
`/`는 dev 대시보드 UI이며 투자/내역 화면과 함께 로그인이 필요합니다. `/login`은 기존 디자인 토큰을 사용하는 독립 반응형 화면입니다. 금융 데이터는 UI fixture이며 실제 계좌 데이터가 아닙니다.

## 실행

패키지 관리자는 pnpm만 사용합니다. Node.js와 pnpm 요구 버전은 `package.json`의
`devEngines.runtime`(Node.js >=22.13.0)과 `devEngines.packageManager`(pnpm 12.5.1)가 기준이며,
`packageManager`도 `pnpm@12.5.1`로 선언되어 있습니다. 해당 선언을 지원하는 pnpm standalone을 준비하면
설치 시 필요한 런타임을 내려받습니다. 의존성과 런타임의 해석 결과는 `pnpm-lock.yaml`에 보존합니다.
현재 lockfile의 Node.js 해석 버전은 26.10.0이며, Node.js 22에 고정된 계약은 아닙니다.

```sh
cd chagok-frontend
pnpm install --frozen-lockfile
# .env.example의 빈 변수들을 .env.local에 로컬 설정 (실제 값은 커밋하지 않음)
pnpm run dev
```

http://localhost:3000 에서 확인합니다. 실행 시 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 필요합니다. Backend 연결 시 서버 전용 `BACKEND_BASE_URL`도 설정합니다. 빌드/단위 테스트에는 실제 자격증명이 필요하지 않습니다.

Google OAuth만으로 로그인합니다. 브라우저에서 PKCE를 시작하고 동일 origin의 `/auth/callback`에서 SSR 세션 쿠키로 교환합니다. 이메일/비밀번호 로그인, 회원가입, 비밀번호 재설정 UI는 제공하지 않습니다. SSR cookie는 proxy에서 갱신하며 페이지/Server Action의 서버 경계에서 `getUser(accessToken)`으로 사용자를 검증합니다. 로그아웃은 현재 로컬 세션을 종료합니다. publishable key만 허용하며 service_role 키나 JWT signing secret을 사용하지 않습니다. Google Cloud/Supabase provider 및 redirect URL 수동 설정과 smoke 절차는 `../docs/api/authentication.md`를 따릅니다. 실제 Google OAuth smoke 통과 전 Email provider를 비활성화하지 마세요.

일반 의존성 설치/lockfile 갱신은 `pnpm install`, 기존 환경 및 CI의 재현 가능한 복원은
`pnpm install --frozen-lockfile`을 사용합니다. 검증/빌드 도구가 필요하므로 dev dependency를 생략하지 마세요.

`pnpm-workspace.yaml`의 `patchedDependencies`는 정확히 `@supabase/auth-js@2.117.1`에
`patches/@supabase+auth-js+2.117.1.patch`를 연결합니다. pnpm은 설치 시 이 native patch를 적용하며
`pnpm-lock.yaml`에 패치 해시를 보존합니다. 패치는 auth-js WebAuthn 선언의 TypeScript 6 DOM 타입 충돌만
해결하며 런타임 로직은 바꾸지 않습니다. 별도 postinstall이나 patch-package는 사용하지 않습니다.

dependency build script 정책도 `pnpm-workspace.yaml`에서 관리합니다. `strictDepBuilds: true`,
`dangerouslyAllowAllBuilds: false`를 유지하고, 현재 `allowBuilds`는 `unrs-resolver@1.12.2`만 허용합니다.
미검토 build script로 설치가 차단되면 해당 package/version을 검토한 뒤 정책에 반영하며 전역 허용으로 우회하지 않습니다.

```sh
pnpm run test
pnpm run typecheck
pnpm run lint
pnpm run build
# 프로덕션 서버: build 성공 후 실행
pnpm run start
```

기본 Turbopack 및 Server Component를 사용합니다. React Compiler, UI/state/query 라이브러리,
Storybook/Playwright는 추가하지 않았습니다. 테스트는 TypeScript 컴파일 후 `scripts/prepare-test-aliases.mjs`로
테스트 alias를 준비하고 Node 내장 test runner로 실행합니다. typecheck는 `next typegen && tsc --noEmit`으로
Next.js route 타입을 먼저 생성한 뒤 검사합니다.
ESLint 9는 deprecated 경고가 있지만 현재 Next preset의 React/import/a11y plugin peer 범위가 9까지라 고정했습니다.
ESLint 10 전환은 해당 plugin 호환 이후에 수행합니다.

## 구조

- `src/app`: 라우팅, metadata, 최소 기본 스타일
- `src/components`: 공통 UI (`AppShell`)
- `src/features/poc`: PoC endpoint adapter 및 런타임 응답 decoder
- `src/lib/api`: 도메인과 독립된 HTTP transport / HTTP error
- `src/types`: backend wire DTO (nullable, 숫자 문자열 유지)
- `src/config`: backend 환경 변수 검증
- `tests`: HTTP/직렬화/설정 경계 테스트. fixture는 실제 API 호출 결과가 아닙니다.

## API 사용 경계

Server Component/Server Action에서 `src/features/poc/api.server.ts`의 `getPocClient()`를 호출합니다.
이 entry는 `server-only`로 Client Component import를 막습니다. `client.ts`는 테스트 가능한 내부 wire adapter이며
UI에서 직접 import하지 않습니다. 현재 금융 UI는 실제 PoC API 호출 대신 fixture를 사용합니다.

`BACKEND_BASE_URL`은 서버 runtime 환경 변수입니다. 예: `http://localhost:8080`.
HTTP(S) origin만 허용하며 path/query/fragment/credentials는 금지합니다.
`NEXT_PUBLIC_`로 노출하지 않습니다. 브라우저에서 backend를 직접 호출하지 않으므로 CORS 변경이나
Next 프록시 endpoint를 추가하지 않았습니다. 검증된 세션의 Bearer token만 서버에서 전달하며 Client Component props로 노출하지 않습니다. `/api/**`는 JWT가 없거나 유효하지 않으면 401, 권한 부족이면 403입니다. 인증은 가구별 데이터 인가를 뜻하지 않습니다. 상세 계약은 `../docs/api/authentication.md`를 따릅니다.

| 메서드 | backend endpoint | client |
|---|---|---|
| GET | `/api/poc/etfs/latest-base-date` | `latestBaseDate(signal?)` |
| GET | `/api/poc/etfs?keyword=&page=&size=` | `searchEtfs(query?, signal?)` |
| POST | `/api/poc/etfs/{ticker}/market-price` | `verifyMarketPrice(ticker, signal?)` |

검색의 page/size를 생략하면 backend 기본값(1/20)이 적용됩니다. 응답은 배열이며 totalCount/page envelope를 만들지 않습니다.
POST는 Google Sheets 쓰기를 수반하므로 자동 retry하지 않습니다. 모든 요청은 `no-store`, redirect 거부이며 AbortSignal을 전달합니다.
응답은 unknown에서 decoder로 검사하고 누락/null/type mismatch를 구분합니다.
HTTP 오류는 `ApiHttpError.status`로 구분하며, 미확정 backend error body는 노출하지 않습니다.
네트워크/취소/JSON 오류는 원래 오류를 전달하고 응답 shape 오류는 `ApiContractError`를 사용합니다.

타입 근거: `PocController.kt`, `PocService.kt`, `publicdata/EtfPriceResponse.kt`, `google/GoogleSheetsClient.kt`.
ETF 가격은 문자열을 유지합니다. Google Sheets의 BigDecimal은 현재 backend가 JSON number로 보내므로
wire 타입은 number입니다. JS JSON 파싱은 정밀도를 잃을 수 있으므로 이 값을 정확한 금융 계산/표시의 근거로 사용하지 않습니다.
실제 금융 화면 연결 전 정밀 숫자 처리와 API error/pagination 계약을 별도로 확정해야 합니다.

## 디자인 및 검증 범위

`../docs/ui/`의 승인 reference/screen-spec 계약은 후속 화면 작업에 그대로 적용합니다.
로그인 화면은 dev UI 기반 CODE_DRIVEN/RESPONSIVE이며 승인된 시각 회귀 baseline을 주장하지 않습니다.
앱/API 구조 및 lint/build/unit test를 검증합니다. 실제 Supabase 로그인·갱신·로그아웃과 실제 프로젝트 JWT/JWKS smoke test는 사용자 로컬 설정이 제공될 때까지 미실행입니다.

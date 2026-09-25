# Chagok Frontend

backend와 병렬인 독립 Next.js App Router + React + TypeScript 프로젝트입니다.
현재 `/`는 시작 안내 셸이며 ETF 검색/시세 검증 UI와 SCR-* 승인 화면은 구현하지 않습니다.

## 실행

패키지 관리자는 pnpm만 사용합니다. Node.js와 pnpm 요구 버전은 `package.json`의
`devEngines.runtime`(Node.js 22.23.2)과 `devEngines.packageManager`(pnpm >=12.0.0 <13.0.0)가 기준입니다.
해당 선언을 지원하는 pnpm standalone을 준비하면 설치 시 필요한 런타임을 내려받습니다.
의존성 및 도구의 해석 결과는 `pnpm-lock.yaml`에 보존하며, 기존 환경 복원에는 frozen install을 사용합니다.

```sh
cd chagok-frontend
pnpm install --frozen-lockfile
# API를 연결할 때 .env.example을 참고해 .env.local에 BACKEND_BASE_URL 설정
pnpm dev
```

http://localhost:3000 에서 확인합니다. API를 호출하지 않는 셸은 backend나 환경 변수 없이 실행/빌드할 수 있습니다.

```sh
pnpm test
pnpm lint
pnpm typecheck
pnpm build
# 프로덕션 서버: build 성공 후 실행
pnpm start
```

기본 Turbopack 및 Server Component를 사용합니다. React Compiler, UI/state/query 라이브러리,
Storybook/Playwright는 추가하지 않았습니다. 테스트는 TypeScript 컴파일 후 Node 내장 test runner로 실행합니다.
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
UI에서 직접 import하지 않습니다. 현재 셸은 API 호출을 하지 않습니다.

`BACKEND_BASE_URL`은 서버 runtime 환경 변수입니다. 예: `http://localhost:8080`.
HTTP(S) origin만 허용하며 path/query/fragment/credentials는 금지합니다.
`NEXT_PUBLIC_`로 노출하지 않습니다. 브라우저에서 backend를 직접 호출하지 않으므로 CORS 변경이나
Next 프록시 endpoint를 추가하지 않았습니다. 인증/권한 정책은 이번 범위 밖입니다.

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
현재 셸은 승인 화면이 아니며 디자인 conformance/regression baseline을 주장하지 않습니다.
앱/API 구조 및 lint/build/unit test를 검증하며, 실제 backend 통합은 외부 서비스 자격증명을 필요로 하므로 별도입니다.

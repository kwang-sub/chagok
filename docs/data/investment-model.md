# 투자 관리 논리 데이터 모델

## 범위와 기준

- Data Task Class: MODEL_CHANGE
- Data Design Mode: DESIGN_FIRST / Data Model Gate: REQUIRED
- Data Model Status: APPROVED — Task t_39f49199의 테이블 책임, t_c547d1ac의 PK·기준정보·활성 정책, t_8e3aede5의 Subject Area·현금흐름 원본 보존형 정정, t_f134f3b2의 가변 업무 행 생성/변경 시각 및 t_79f7c7f5의 승인된 복구 기록(2026-09-25)에 따른 Supabase Auth 참조·멤버십 유일성·이력 보존 경계를 구체화한다. 물리 스키마 또는 API 구현 승인이 아니며, 아래 미확정 정책은 승인된 것으로 간주하지 않는다.
- Task t_d91bc9db의 승인 범위로 application-owned household, household_member.household_id 관계와 현재 role을 추가하고 전체 DBML의 한글 논리명·설명 Note를 보강한다. Auth 원본 소유권·비복사·이력 비-cascade와 기존 투자 불변식은 유지한다.
- Task t_15d4cc3d의 승인 범위로 identity 영역의 외부 관리 auth_user 참조와 사용자 수행 변경의 audit actor를 추가한다. owner_member_id의 명의·과거 귀속 역할은 유지하고 자동/불변 snapshot의 actor 및 물리 구현은 포함하지 않는다.
- Task t_cc25cd7f의 승인 범위로 application-owned app_user를 추가하고 멤버십·audit actor를 내부 app_user.id 참조로 전환한다. 외부 Auth UUID는 app_user.auth_user_id로 매핑하며 명의·snapshot·원장 생명주기는 유지한다. 앞선 작업의 검증 기록은 당시 결과이며 현재 계약은 이 전환을 반영한다.
- Task t_cba24c92의 승인 범위로 Auth 탈퇴 기본 정책을 Supabase Auth soft delete로 명시하고, app_user의 공통 표시명·최초 provisioning 시각, 시스템 관리 종목의 actor 제외, 평가 확정 단방향 전이·불변성 및 단일 공급자 가격 재수집 갱신 계약을 반영한다. 실행 결과의 suggestion_id 구조와 proposal set 단위 실행 헤더 모델은 변경하지 않는다.
- Database Vendor / Version: unknown / unknown
- Data Model Mode: LOGICAL_RELATIONAL
- DBML Mode: CANONICAL / [schema.dbml](schema.dbml)
- Data Naming Source: PROJECT_EXISTING — 최초 모델의 DEVKIT_DEFAULT에서 유래한 기존 승인 DBML을 이번 작업의 기준으로 재사용한다. 단수 snake_case 테이블/컬럼, 내부 PK id 및 기존 의미별 FK 이름(account_id, owner_member_id 등)을 보존하며 자동 rename하지 않는다.
- 적용 capability: dev-data-feature, dev-data-modeling, dev-db-schema(논리 무결성 검토만).

요구사항 출처:

- [SCR-020 투자 포트폴리오](../product/screens/SCR-020-investment-portfolio.md): 계획/실행 분리, 현재 보유정보 보정, 시뮬레이션, 소유권.
- [SCR-022 투자 내역](../product/screens/SCR-022-investment-history.md): 실행 단위, 제안/실제 결과 분리, 상태 및 비활성화.
- [기능 요구사항](../product/04-feature-requirements.md): FTR-001~005, FTR-201~208 및 별도 마스터 통합 승인 대상인 FTR-901/902.
- [투자 성과 계산 명세](../product/06-investment-performance.md): 연도별 성과, 외부 순유입, XIRR, 확정 평가액.

최초 모델 작성 시 DBML 이전의 persistence convention은 없었고, JPA/JDBC driver/Flyway/Liquibase 및 DB 설정이 없다는 근거로 논리 모델을 도입했다. 이번 작업은 기존 두 데이터 문서의 convention을 보존한다. canonical project metadata인 /workspace/chagok/.hermes/project.yaml도 database_vendors를 빈 목록으로 기록한다. linked worktree 안의 .hermes/project.yaml은 project/board/base의 근거로 사용하지 않는다. frontend, Kotlin, dependency, migration, endpoint, 운영 DB는 변경하지 않는다.

DBML은 관계/핵심 nullability/키의 canonical source이고 이 문서는 DBML로 표현하지 못하는 업무 불변식을 보완한다. varchar 상태는 논리 코드 집합이지 vendor enum 또는 API wire contract가 아니다. DBML의 notes와 아래 조건은 실행되는 CHECK 제약이 아니며, 후속 물리 설계에서 CHECK/복합 FK/UNIQUE 및 트랜잭션 검증으로 구현해야 한다.

모든 DBML Table의 표준 `Note`는 첫 줄의 한글 논리 테이블명과 빈 줄 뒤 책임·업무 의미·핵심 생명주기 문단으로 구성한다. 모든 column `note`는 한글 논리 컬럼명으로 시작하고 필요한 설명을 뒤에 붙인다. 별도 `logical_name` 속성이나 도구 전용 metadata를 추가하지 않는다.

## 주제영역과 책임 경계

canonical DBML의 TableGroup을 주제영역의 단일 표현으로 사용한다. 승인된 기존 논리 테이블 이름은 유지하며, 화면 메뉴나 물리 테이블 이름으로 재구성하지 않는다.

| 주제영역 | 소속 논리 테이블 | 책임·소유권·생명주기 근거 |
|---|---|---|
| identity | auth_user, app_user | auth_user는 Supabase Auth 소유의 외부 인증 원본 참조, app_user는 application-owned 내부 사용자 매핑이다. 외부 인증 원본·내부 사용자·가계 멤버십의 책임과 생명주기를 분리하며 Auth 속성을 복제하지 않는다. |
| household | household, household_member | 애플리케이션 소유 가계 경계와 가계 소속·명의 기준의 독립 책임. 가계 비활성화와 계좌 종료 이후에도 과거 귀속을 보존한다. |
| investment | investment_account, investment_holding, investment_funding_plan, investment_funding, investment_suggestion_snapshot, investment_execution_result, investment_cash_flow, investment_valuation_snapshot | 명의자가 소유하는 투자계좌를 중심으로 현재 보유·계획·실행·실제 자금 이동·평가를 관리한다. 현재 상태, 사건 이력, 불변 snapshot의 서로 다른 생명주기는 아래 계약을 유지한다. |
| market | security_instrument, market_price_snapshot | 특정 투자계좌 및 가격 공급자와 독립된 종목 기준과 시장 관측 책임. 계좌 비활성화가 종목/가격 이력을 종료하지 않는다. |

14개 테이블은 각각 하나의 영역에만 속한다. household_member.household_id는 같은 영역의 household.id를 참조한다. investment_account/funding의 명의 참조는 household, holding/suggestion의 종목 참조는 market으로 기존 Ref를 연결하며 테이블을 중복 소속시키지 않는다. household_member.app_user_id와 사용자 수행 변경의 actor는 identity 영역의 app_user.id를 참조하고 app_user.auth_user_id만 auth_user.id를 참조한다.

## 책임·소유권·생명주기

| 테이블 | 책임 및 데이터 성격 | 관계와 종료 정책 |
|---|---|---|
| auth_user | 외부 관리 인증 사용자 참조, Supabase auth.users 소유권 유지 | 인증 사용자 1 : app_user 0..1. 탈퇴 기본 정책은 Supabase Auth soft delete이며 app_user·멤버십·투자 이력·audit actor를 cascade 삭제하지 않음. 실제 호출·비식별화·FK delete action은 후속 결정. |
| app_user | 애플리케이션 소유 내부 사용자 매핑·공통 현재 표시명·최초 provisioning 시각, 현재 기준 엔티티 | 정확히 한 auth_user 참조, auth_user_id 논리 UNIQUE. 내부 사용자 1 : 서로 다른 가계의 멤버십 0..N 및 각 역할별 actor 참조 0..N. 최초 인증/온보딩에서 생성·조회하며 Auth soft delete에도 내부 PK와 이력을 보존. |
| household | 애플리케이션 소유 가계 경계와 현재 표시명·활성 상태 | 가계 1 : 멤버십 0..N. 활성 가계에는 활성 OWNER가 최소 한 명 필요하다. 비활성화해도 멤버십·계좌·투자 이력을 삭제하지 않는다. |
| household_member | 인증 사용자 프로필과 분리된 가계 멤버십/명의 기준 및 현재 역할 | 멤버십은 정확히 한 가계와 한 app_user에 속한다. 구성원 1 : 계좌 0..N. 내부 사용자 1 : 서로 다른 가계의 멤버십 0..N. 가계·내부 사용자 참조는 논리 경계이며 실행되는 FK가 아니다. 탈퇴나 Auth 사용자 삭제로 과거 명의를 지우지 않는다. |
| investment_account | 명의자 소유 증권계좌, 현재 기준정보 | 계좌마다 정확히 한 명의자. 비활성화 후에도 과거 참조 유지. |
| security_instrument | 시스템이 생성·갱신하는 시장/티커별 종목 기준 | 종목 1 : 보유/제안/가격 각각 0..N. 사용자 actor나 system actor 테이블을 두지 않음. PoC URL이나 응답 DTO를 키로 사용하지 않는다. |
| investment_holding | 계좌-종목의 현재 수량/평균매입가/목표비중 | 계좌와 종목의 N:M association. 비활성 포함 계좌-종목당 한 행. |
| investment_funding_plan | 반복 정기 투자 계획, 변경 가능한 미래 조건 | 계좌 1 : 계획 0..N, 계획 1 : 투입 건 0..N. 종료/변경이 생성된 회차를 수정하지 않는다. |
| investment_funding | 계좌·명의·예산·예정/처리일·상태를 가진 실행 이력 | 계좌 1 : 투입 0..N. 계획 연결은 0..1. 추가/일시 투자도 독립 행. |
| investment_suggestion_snapshot | 특정 투자 건의 종목별 가격/비중/매수 제안, 불변 snapshot | 투입 1 : 제안 0..N. 한 simulation의 행들은 proposal_set_key로 묶는다. |
| investment_execution_result | 제안에 대한 처리 결과, 선택 입력 가능한 실제 수량/금액 | 제안 1 : 결과 0..1. 결과 부재는 미입력이지 건너뜀/실패가 아니다. 체결 lot 원장이 아니다. |
| investment_cash_flow | 실제 외부 입출금/내부 이동 사건, 성과의 원천 이력 | 계좌가 각 endpoint로 0..N 참여. 투입 건 연결 0..1, 투입 건에는 현금흐름 0..N 가능. |
| investment_valuation_snapshot | 계좌별 기준시점 평가액, 정책을 포함한 평가 이력 | 계좌 1 : 평가 0..N. 확정 평가를 현재 보유정보로 덮어쓰지 않는다. |
| market_price_snapshot | 시스템이 단일 공급자에서 수집한 종목·기준시각별 최신 성공 관측값 | 종목 1 : 가격 0..N. 같은 종목·기준시각 재수집은 기존 price/fetched_at 갱신이며 모든 재수집 전 값 이력을 보존하지 않음. 제안에 가격을 복사하므로 가격 보존기간에 제안 이력이 종속되지 않는다. |

계좌의 owner_member_id와 구성원의 household_id는 과거 귀속을 바꾸지 않는다는 논리 전제다. 복수 가계 참여는 서로 다른 household_id의 별도 멤버십 행으로 표현하며 기존 행의 가계를 UPDATE하지 않는다. 명의 이전과 가계 이동은 유효기간/이전 이력 모델의 별도 승인 대상이다. 동일 가계 조회와 명의자 변경 권한은 향후 application 인증/인가 책임이며 FK만으로 보안이 구현되었다고 주장하지 않는다. 계좌번호/인증 비밀정보는 모델링하지 않는다.

### 가계와 현재 멤버십 역할

- `household.id`는 애플리케이션 소유 가계의 불변 내부 PK이며 `display_name`은 업무 표시명이다. `is_active`는 삭제 표식이 아니다. 생성·변경 시각은 아래 가변 업무 행 계약을 따른다.
- 기존 `household_ref`는 `household_id`로 대체하고 `household.id`로의 필수 논리 Ref를 둔다. 가계 이름은 후보키가 아니며 이름 중복 금지나 가계 이동을 새로 승인하지 않는다.
- `household_member.role`은 필수 논리 코드 `OWNER | EDITOR | VIEWER`로 현재 멤버십의 권한 구분만 표현한다. 투자계좌의 `owner_member_id`와는 다른 개념이며 역할 변경은 계좌 명의 이전이 아니다. 역할 변경 이력, 세부 권한표, RLS/서버 인가 구현은 포함하지 않는다.
- 활성 가계에는 `is_active=true`이고 `role=OWNER`인 소속 멤버십이 최소 한 개 있어야 한다. 활성 가계 생성·재활성화, OWNER의 역할 변경·비활성화·탈퇴가 이 불변식을 깨뜨려서는 안 된다. 복수 OWNER는 금지하지 않는다. 동시 변경에도 마지막 활성 OWNER를 잃지 않도록 할 원자적 검증·잠금·DB 제약과 Auth 탈퇴 연계 절차는 후속 MIGRATION/보안 설계에서 정한다.
- 가계 비활성화는 멤버십·계좌·투자 이력의 삭제 또는 현금흐름 무효화가 아니다. 자식 행 상태의 자동 전파나 재활성화 절차는 이번 논리 계약으로 확정하지 않는다.

### Supabase Auth와 내부 사용자 경계

- `auth.users`는 Supabase Auth가 관리하는 외부 인증 원본이다. identity 영역의 `auth_user`는 이를 가리키는 외부 관리 논리 테이블이며 canonical 식별자 `id uuid`만 표현한다. application-owned 테이블로 재정의하거나 실제 Auth DDL을 생성·수정하지 않는다. UUID 표기는 외부 인증 식별자의 논리 값 영역이며 특정 DBMS 타입이나 물리 FK를 확정하지 않는다.
- `app_user.id bigint`는 애플리케이션 소유의 불변 내부 PK다. 필수 `app_user.auth_user_id uuid → auth_user.id`와 논리 UNIQUE로 외부 인증 사용자 하나당 내부 사용자 매핑을 최대 하나 허용한다. 각 app_user는 정확히 한 auth_user를 참조하며, provisioning 전 auth_user에는 app_user가 없을 수 있다. Auth 원본과 내부 사용자 매핑은 별도 책임이다.
- 최초 인증/온보딩에서 `auth.users.id`를 기준으로 app_user를 생성·조회하는 provisioning이 필요하다. 이후 멤버십과 사용자 수행 변경의 actor에는 조회된 내부 `app_user.id`를 사용한다. app_user 생성 시 내부 actor가 아직 없으므로 이 테이블에 created_by/updated_by를 강제하지 않는다. 자기 참조 actor, 임의 system user, DB default로 초기화를 우회하지 않는다. provisioning 중복·동시 요청의 처리, 기존 외부 UUID의 매핑 및 멤버십·actor backfill, JWT actor 전달·검증은 후속 구현 결정이다.
- `app_user.created_at timestamp not null`은 내부 사용자 매핑의 최초 provisioning 시각이며 조회·재시도나 표시명 변경으로 바꾸지 않는다. `app_user.display_name varchar not null`은 모든 가계에서 공통으로 사용하는 application-owned 현재 사용자 표시명이다. 둘 다 Auth metadata 복제·동기화 필드가 아니며 created_at은 Auth 사용자 생성 시각이 아니다. `household_member.display_name`은 제거하고 멤버십은 가계 소속·현재 role·명의 귀속만 담당한다. 가계별 별칭이나 과거 표시명 snapshot은 추가하지 않는다.
- `household_member.id`는 가계 멤버십·투자 명의 귀속 행의 내부 PK다. 필수 `app_user_id bigint → app_user.id`는 멤버십 대상을, `created_by`/`updated_by`는 변경 수행자를 나타낸다. 같은 `app_user.id`를 참조해도 역할은 별개이며 멤버십 대상 사용자나 명의자를 actor로 자동 대입하지 않는다. `owner_member_id → household_member.id`는 명의·과거 투자 귀속 관계이므로 rename하거나 app_user/Auth 참조로 바꾸지 않는다. `household_id`의 논리 참조 대상은 application-owned `household.id`로 유지하며 실제 물리 FK/delete action은 후속 결정한다.
- 내부 사용자 1명은 서로 다른 가계의 멤버십을 여러 개 가질 수 있다. `(household_id, app_user_id)` 논리 UNIQUE는 비활성 행을 포함해 동일 가계의 동일 내부 사용자 중복 멤버십을 금지한다. `household_member.app_user_id` 단독 UNIQUE는 두지 않는다. 재가입·재활성화의 상세 정책은 별도 결정하되 중복 행 생성으로 이 유일성을 우회하지 않는다.
- `auth.identities` 역시 외부 Auth 관리 데이터이며 멤버십이나 투자 명의의 키로 사용하지 않는다. `auth.identities`, 이메일·전화·provider·metadata(`app_metadata`·`user_metadata` 포함)·세션·토큰·자격증명은 `auth_user`, `app_user`, `household_member`에 복사하거나 업무 키/인가 근거로 사용하지 않는 것이 이 모델의 계약이다. 공통 사용자 표시명은 `app_user.display_name`에서만 관리하며 Auth 프로필 metadata를 복제·동기화하지 않는다.
- Auth 탈퇴의 기본 정책은 Supabase Auth soft delete다. `app_user`, `household_member`, 투자 이력 및 audit actor를 cascade 삭제하지 않는 것이 보존 불변식이다. 내부 사용자 PK, 계좌·투자금의 `owner_member_id`와 과거 귀속, 생성·변경·기록·무효화 수행자 참조를 보존해야 한다. 실제 Supabase Auth 설정/deleteUser 호출, 로그인 차단, FK delete action, 삭제 허용 조건, 참조 유지·비식별화 절차, trigger 및 탈퇴 실행 절차는 후속 결정·검증 대상이다. 현재 필수 외부 참조만으로 삭제 lifecycle이 해결되었다고 간주하지 않는다.
- soft delete 이후 재가입 시 Auth UUID와 새 app_user를 발급할지, 기존 가계 멤버십을 자동 복구할지는 미확정이다. soft delete가 기존 계정 복구를 보장한다고 해석하지 않으며, 기존 내부 PK·이력 보존과 재가입·복구 정책을 구분한다.
- 논리 참조와 UNIQUE는 인증·인가 구현이 아니다. 가계별 접근 격리, RLS/서버 인가와 Auth 계정 삭제 lifecycle은 후속 물리화·보안 설계에서 별도로 결정하고 검증한다. 실제 DB 연결 플랫폼이나 RLS 배포 상태는 추정하지 않는다.

## 식별자 역할과 테이블 분류

application-owned 테이블의 `id`는 application/domain 소유의 불변 내부 PK다. 외부 관리 참조인 `auth_user.id`는 예외로 Supabase Auth 소유의 UUID이며 앱이 생성하지 않는다. 앱은 별도 `app_user.id`를 내부 사용자 PK로 소유하고 외부 UUID를 `app_user.auth_user_id`로 매핑한다. 관계는 해당 키를 참조하며, 아래 업무 후보키나 화면 표시값으로 PK를 교체하지 않는다. DBML의 bigint는 논리 표기일 뿐 IDENTITY/sequence/UUID 등 물리 생성 전략을 선택하지 않는다.

| 테이블 | 분류 및 소유 범위 | 내부 id가 식별하는 대상·보조 식별 근거 | public_id / external_id 판단 |
|---|---|---|---|
| auth_user | 외부 관리 인증 원본의 논리 참조, Supabase Auth 소유 | id uuid는 물리 원본 auth.users.id를 표현하며 앱이 생성·복제하는 사용자 행이 아님 | 승인된 외부 인증 식별자 id만 표현. 별도 public_id/external_id나 Auth 속성 복제 없음 |
| app_user | 기준 엔티티, 애플리케이션 소유 내부 사용자 | id bigint는 불변 내부 PK. auth_user_id uuid는 외부 인증 참조이자 논리 UNIQUE | 승인된 외부 식별자는 의미가 명확한 auth_user_id에 저장. 범용 external_id/public_id나 Auth 속성은 추가하지 않음 |
| household | 기준 엔티티, 애플리케이션 소유 가계 | 가계 경계. 표시명은 식별키가 아님 | 공개·외부 시스템 식별자 요구 없음. public_id/external_id를 추가하지 않음 |
| household_member | 기준 엔티티, 가계 소속 구성원 | 명의 주체인 멤버십 행. (household_id, app_user_id)는 동일 가계의 중복을 막는 논리 후보키 | 공개 식별자 요구 없음. app_user_id는 내부 사용자 참조이며 외부 UUID를 중복 저장하지 않음 |
| investment_account | 기준 엔티티, 명의자 소유 | 계좌 인스턴스. 계좌명/기관명은 식별키가 아님 | API/URL/event 노출 계약 및 금융기관 계좌 ID 연동 요구 없음. 둘 다 추가하지 않음 |
| security_instrument | 기준 엔티티, 공급자와 독립된 종목 | 상장 종목. (market_code, ticker)는 논리 후보키 | 공개 ID/공급자 발급 ID 계약 없음. ticker는 상장 업무 코드이지 범용 external_id가 아님 |
| investment_holding | 현재 상태, 계좌 소유 association | 현재 보유 행. (account_id, security_id)는 비활성 포함 유일 | 현재 보유 편집 요구만 있음. 공개/외부 시스템 식별자 요구 없음 |
| investment_funding_plan | 현재 상태, 계좌 소유 | 반복 계획 행. 반복 규칙 자체는 식별자가 아님 | 내부 계획 등록 요구만 있음. 공개/외부 시스템 식별자 요구 없음 |
| investment_funding | 업무 이력과 현재 처리 상태, 계좌·명의 귀속 | 실행 회차. plan 연결 시 (plan_id, plan_occurrence_key)가 후보키 | plan_occurrence_key는 내부 멱등 회차 키. 공개/외부 시스템 식별자 요구 없음 |
| investment_suggestion_snapshot | snapshot, 투입 건 소유 | 제안 종목 행. (funding_id, proposal_set_key, security_id)가 후보키 | proposal_set_key는 내부 계산 묶음 키. 공개/외부 시스템 식별자 요구 없음 |
| investment_execution_result | 현재 처리 상태, 제안 소유 | 처리 결과 행. suggestion_id는 결과가 존재할 때 유일 | 체결 원장/외부 주문 연동이 아님. 공개/외부 시스템 식별자 요구 없음 |
| investment_cash_flow | 사건 원장, endpoint 계좌 및 가계 범위 | 실제 이동 사건. source_event_key는 유일한 멱등 사건 키 | 실제 수입 연동 계약은 미정. source_event_key를 공급자 발급 external_id로 가정하지 않으며 공개 ID도 추가하지 않음 |
| investment_valuation_snapshot | snapshot, 계좌 소유 | 시점 평가 행. (account_id, as_of_at)이 후보키 | 내부 성과 재현 요구만 있음. 공개/외부 시스템 식별자 요구 없음 |
| market_price_snapshot | 관측 snapshot, 종목 귀속 | 단일 공급자의 종목·기준시각별 최신 성공 관측 행. (security_id, price_as_of_at)이 논리 후보키 | 공급자 선정/관측 ID 계약 없음. 공개/외부 시스템 식별자 요구 없음 |

`public_id`는 승인된 API/URL/event 공개 식별 요구가 생기는 엔티티에만 검토한다. `external_id`는 실제 다른 시스템이 발급·소유하는 식별자의 연동 요구가 생길 때만 검토하며, 공급자 namespace·유일성·변경 정책을 함께 정한다. 아직 없는 식별자를 모든 테이블에 선제 추가하지 않는다. 내부 FK/JOIN은 별도 근거가 없는 한 id를 유지한다. 멤버십 app_user_id와 audit actor는 내부 app_user.id를 각각 참조하되 대상과 실제 수행자의 의미를 구분한다. 외부 Auth UUID는 app_user.auth_user_id로만 매핑한다.

위 후보키는 id와 별개의 논리 중복 방지 조건이다. 기존 투자 PK/FK/UNIQUE/nullability 및 현금흐름 lifecycle 필드와 선택 정정 Ref를 유지한다. 기존 identity_user_ref를 제거하고 필수 app_user_id bigint 및 (household_id, app_user_id) UNIQUE로 대체한다. actor의 타입·참조 대상은 내부 사용자로 바꾸되 기존 필수/선택 의미는 유지한다. household와 필수 role, 가계 논리 Ref 및 가변 업무 테이블의 생성/변경 시각도 유지한다. plan 연결의 두 nullable 컬럼 동반 존재, 현금흐름 endpoint 조건, 상태별 processed_on/voided_at 필수 등 조건부 nullability는 아래 업무 불변식으로 보완한다. nullable UNIQUE의 물리 동작이나 복합 FK/CHECK/삭제 cascade가 이미 구현됐다는 의미가 아니다.

## 기준 엔티티와 논리 코드값

household, household_member, investment_account, security_instrument는 표시 문자열 목록이 아니다. 각각 가계 경계, 가계 소속/명의, 소유 계좌, 상장 종목이라는 독립 책임·소유 경계·생명주기가 있고 다른 데이터가 안정적으로 참조하므로 기준 엔티티로 유지한다. 반면 분류나 상태를 나타낸다는 이유만으로 코드마다 테이블을 만들지 않는다.

| 코드 | 현재 모델의 결정 | 전용 기준정보 승격 시 확인할 근거 |
|---|---|---|
| household_member.role | OWNER / EDITOR / VIEWER의 현재 멤버십 권한 구분. 역할 이력이나 권한 구현이 아님 | 역할 정의의 독립 관리 요구와 세부 권한 정책의 별도 승인 |
| account_type | 논리 선택 코드 유지. 공통 계좌유형 마스터 FK는 이번 범위 밖 | 제품 FTR-901/902 관리자 선택값 요구와 투자계좌 연결 범위, 소유자·키·비활성 참조 계약 확정 |
| instrument_type | ETF 등 논리 분류 코드 | 독립 관리 주체/화면, 분류 속성·관계·변경 이력 필요 여부 |
| funding/result/cash_flow/valuation의 status | 각각의 상태 전이를 표현하는 논리 코드. 공통 status 마스터로 통합하지 않음 | 상태 정의의 독립 관리 요구 및 전이 규칙과의 일관성 보장 |
| currency_code | 초기 KRW 및 통화 일치 조건을 위한 논리 코드 | 통화별 속성/유효기간/외부 매핑 및 실제 FX 요구 |
| market_code | ticker의 listing namespace인 논리 코드 | 시장의 독립 lifecycle·관리 화면·공급자 매핑·유효기간 요구 |

funding_type, action, flow_type, cash_inclusion_policy 역시 승인된 논리 값 집합으로 유지한다. 전용 마스터로 승격하려면 독립 소유자, 생성/변경/종료 생명주기, 유효기간, 관리 UI/권한, 외부 매핑 중 실제 요구를 근거로 책임·키·참조·이력 정책을 승인해야 한다. 단순 코드 개수나 미래 확장 가능성만으로 범용 코드 테이블을 도입하지 않는다.

제품 문서 FTR-901/902에는 공통 계좌유형의 관리자 관리 요구가 존재한다. 이를 요구가 없는 것으로 삭제하거나 부정하지 않는다. 다만 이번 승인 계획은 투자 모델에 연결할 마스터의 구체 계약을 미확정으로 남기고 account_type을 논리 코드로 유지하도록 범위를 정했다. 따라서 관리자 마스터 통합은 후속 승인 대상이며 현재 코드값만으로 해당 제품 기능을 구현했다고 주장하지 않는다. 다른 코드에도 동일한 독립 관리 요구가 확정되면 이 경계를 재검토한다.

## audit·업무 활성·삭제 정책

| 대상 | 보존하는 시각과 의미 | 추가하지 않는 항목 및 해석 경계 |
|---|---|---|
| app_user | created_at: 내부 매핑 최초 provisioning 시각, 이후 보존 | Auth 생성 시각·metadata 복제 아님. updated_at이나 actor를 이번에 추가하지 않음 |
| household | created_at: 가계 행 최초 생성, updated_at: 표시명·업무 활성 변경 | 가계 비활성화가 멤버십·계좌·투자 이력 삭제를 뜻하지 않음 |
| household_member | created_at: 구성원 행 최초 생성, updated_at: 역할·업무 활성 등 허용된 현재 멤버십 정보 변경 | 표시명은 app_user 소유. 가입/탈퇴일, 인증 사용자 생성 시각이나 가계 이동 허용을 뜻하지 않으며 역할 변경 이력을 복원하지 않음 |
| investment_account | created_at: 계좌 행 최초 생성, updated_at: 계좌 기준정보·업무 활성 변경 | 금융기관 계좌 개설일이나 명의 이전 허용을 뜻하지 않음 |
| security_instrument | created_at: 종목 기준 행 최초 생성, updated_at: 허용된 기준정보·업무 활성 변경 | 상장일/가격 관측 시각이 아니며 시세 갱신으로 변경하지 않음. listing 식별 변경 정책은 별도 승인 |
| investment_funding_plan | created_at: 반복 계획 행 최초 생성, updated_at: 반복 조건·금액·메모·업무 활성 변경 | starts_on/ends_on과 구분하며 생성된 회차를 소급 변경하지 않음 |
| investment_holding | created_at: 현재 보유 행 최초 생성, updated_at: 수량·원가·목표비중·업무 활성 등 현재 값 보정 | 매수일/체결 시각이 아님. 재활성화 시 created_at 보존. 이전 값 복원/수정 주체까지 보장하는 audit 이력으로 해석하지 않음 |
| investment_funding | created_at: 행 생성, updated_at: 현재 처리 상태/내용 변경 | 모든 상태 전이의 원장으로 해석하지 않음 |
| investment_execution_result | created_at: 결과 행 최초 생성, updated_at: 결과 입력/보정, processed_on: 업무 처리일 | 제안 계산 시각/체결 시각 또는 전체 변경 이력을 추정하지 않음 |
| investment_cash_flow | recorded_at: 사건 기록, occurred_on: 실제 자금 이동일, voided_at: 무효화 시각 | 원장에 updated_at을 기계적으로 추가하거나 조용한 덮어쓰기 허용으로 해석하지 않음. status/void_reason으로 명시적 무효화를 남김 |
| investment_suggestion_snapshot | calculated_at 및 사용 가격의 기준/조회시각 | 불변 제안에 update audit를 추가하지 않음 |
| investment_valuation_snapshot | as_of_at: 평가 기준, captured_at: 저장된 평가 포착 시각 | 확정 후 불변. PROVISIONAL 정정 이력 추적 방식은 미확정이며 무의미한 update audit를 선제 추가하지 않음 |
| market_price_snapshot | price_as_of_at: 가격 기준, fetched_at: 해당 기준시각의 최신 성공 수집 시각 | 동일 (security_id, price_as_of_at) 재수집은 price/fetched_at 갱신. 별도 update audit나 재수집 전 값 전체 이력은 없음 |

가변 업무 행 8종은 created_at/updated_at을 필수로 가진다. 생성 시 두 값을 같은 생성 시각으로 명시하고, 이후 허용된 내용/상태 변경은 created_at을 보존하며 updated_at에 마지막 변경 시각을 기록한다. updated_at은 created_at보다 이를 수 없다. investment_funding의 기존 생성/현재 처리 상태 변경 의미와 holding/result의 기존 updated_at 의미를 유지한다. 마지막 변경 시각은 이전 값, 모든 상태 전이 또는 변경 주체의 이력을 복원하지 못하며, 미승인 상태 전이나 소유권 변경을 허용하는 근거가 아니다.

timestamp는 논리적으로 UTC Instant를 표현한다. 실제 DB 시간 타입·정밀도·업무일 경계와 저장 강제 방식은 미확정이며 자동 기본값을 도입하지 않는다. 업무일(date) 및 원장·snapshot의 기존 기록/계산/포착/조회 시각은 생성/변경 audit와 구분한다. 원장/불변 snapshot에는 중복 created_at이나 무의미한 updated_at을 일괄 추가하지 않는다.

### 사용자 수행 변경의 audit actor

| 대상 | actor 및 논리 Ref | 생명주기 |
|---|---|---|
| household, household_member, investment_account, investment_holding, investment_funding_plan, investment_funding, investment_execution_result | created_by bigint 필수, updated_by bigint 필수; 각각 app_user.id 참조 | 사용자 수행 가변 업무 행 7종. 생성 시 created_by = updated_by. 최초 생성자는 불변이며 이후 허용 변경 시 마지막 변경자만 갱신. |
| security_instrument | created_by/updated_by 및 해당 app_user actor Ref 없음 | 시스템이 생성·갱신하는 기준정보. created_at/updated_at은 유지하고 system actor 테이블은 추가하지 않음. |
| investment_cash_flow | recorded_by bigint 필수, voided_by bigint 선택; 각각 app_user.id 참조 | recorded_by는 사건 기록 후 보존. ACTIVE의 voided_by는 null, VOIDED에는 무효화 수행자를 명시. created_by/updated_by는 추가하지 않음. |
| app_user | created_by/updated_by 강제 없음 | 최초 provisioning 시 내부 actor가 아직 없는 초기화 예외. 외부 인증 UUID·내부 PK 매핑, 공통 표시명과 최초 provisioning 시각을 소유. |
| investment_suggestion_snapshot, investment_valuation_snapshot, market_price_snapshot | 이번 범위에서 actor 추가 없음 | 자동/불변 계산·관측 이력의 기존 시각과 생명주기 유지. system/batch actor는 별도 DESIGN 대상. |

- actor는 인증 요청의 외부 Supabase UUID로 매핑·조회한 내부 app_user.id를 애플리케이션이 명시적으로 채운다. 외부 UUID를 actor에 직접 저장하지 않는다. DB default, 0/-1 또는 임의 system user를 도입하지 않는다. JWT actor 전달·검증과 인가 구현은 후속 애플리케이션/보안 설계이며 이 문서가 구현 완료를 뜻하지 않는다.
- 각 필수 actor는 정확히 한 app_user를 참조하고 내부 사용자 한 명은 각 역할별로 0..N행에서 참조될 수 있다. voided_by는 상태에 따른 선택 참조이며 생성자와 변경자, 기록자와 무효화 수행자가 같아야 한다는 제약은 생성 시 created_by = updated_by 외에는 두지 않는다.
- 변경·재활성화는 기존 created_by를 보존한다. 마지막 변경자만 저장하므로 모든 변경 주체의 이력을 복원하지 못하며, actor 추가로 미승인 상태 전이·명의 이전을 허용하지 않는다. owner_member_id는 명의자 역할을 그대로 유지한다.
- 무효화는 원본 recorded_by를 보존하며 voided_at과 함께 voided_by를 기록한다. 대체 ACTIVE 사건은 자체 recorded_by를 가지며 voided_by는 null이다. actor 필드는 원장의 append-only 및 명시적 무효화 예외를 변경하지 않는다.
- 시스템 생성·갱신 종목 기준정보는 사용자 actor를 요구하지 않는다. 이 승인은 필수 actor를 가진 반복 회차 생성 등 다른 테이블의 배치 쓰기를 허용하지 않는다. 해당 필수 actor를 null이나 임의 사용자로 우회하지 않으며 나머지 system/batch 쓰기 경로는 별도 DESIGN에서 결정해야 한다.
- Auth 사용자 삭제로 app_user·멤버십·투자 이력·audit actor를 cascade 삭제하지 않는다. 실제 FK delete action, 비식별화, RLS, trigger 및 기존 자료의 내부 사용자 매핑·actor backfill은 후속 결정이다.

is_active는 가계/구성원/계좌/종목/보유/계획의 업무 사용 가능 여부다. 비활성 행은 신규 선택/활용을 제한하되 과거 참조와 현금흐름·평가 집계는 보존한다. 계획 종료일과 업무 상태는 각각의 생명주기를 표현하며 삭제를 뜻하지 않는다. funding.status의 INACTIVE 역시 삭제 표식이 아니다. 외부 Auth 탈퇴의 기본 정책은 Supabase Auth soft delete지만 application-owned 행에 deleted_at/deleted_by/is_deleted를 추가하는 승인은 아니다. is_active와 삭제 상태를 중복 source of truth로 만들지 않는다. 이 결정은 물리 삭제 허가가 아니며 탈퇴·계좌 종료·잘못된 원장 사건을 임의 삭제로 처리하지 않는다.

## Current / History / Snapshot / Derived 경계

- 현재 보유정보는 수정 가능하다. quantity, average_purchase_price, target_allocation을 보정하고 updated_at을 기록한다. 이전 값의 상세 이력은 미확정이며 현재 모델만으로 모든 보정 전 값을 복원할 수 있다고 주장하지 않는다.
- 투자금 투입 행은 회차별 업무 이력이다. 현재 상태와 생성/변경 시각을 보존하지만 모든 상태 전이 이벤트를 저장하는 audit ledger는 아니다. 상세 상태 전이/보정 이력 저장 방식은 후속 결정이다.
- 제안은 작성 시 funding_amount_snapshot, holding_quantity_snapshot, 비중, 제안금액/수량, 사용 가격/기준시각/조회시각을 고정한다. 종목명도 당시 표시값을 보존한다. 현재 종목/보유/시세 변경은 과거 제안을 바꾸지 않는다.
- 재시뮬레이션은 새로운 proposal_set_key로 전체 종목 행을 함께 생성한다. 동일 set 내 계산시각과 예산은 일치해야 하며 일부 행만 교체하지 않는다. (funding_id, proposal_set_key, security_id)는 중복을 거부한다. 정확한 알고리즘 재실행에 필요한 알고리즘 버전/추가 입력은 배분식 확정 후 결정하고, 현재 모델은 저장된 제안 결과 조회를 보장한다.
- 결과는 제안과 별도다. BUY_COMPLETED/SELL_COMPLETED/SKIPPED는 금액/수량을 입력하지 않고도 기록 가능하다. null은 미입력이고 0과 다르다. 결과가 현재 보유수량이나 외부 원금을 자동 변경한다는 계약은 없다.
- 한 투입 건에서 실제 완료 결과를 기록하는 proposal set은 하나여야 한다. 완료 결과가 생기면 다른 set으로 재실행/전환하지 않는다. 전환/부분 재실행은 보정 정책 승인 전 차단한다. 결과 중복 입력은 suggestion_id UNIQUE와 원자적 상태 검증으로 막아야 한다.
- 현재 평가금액, 현재비중, 비중 차이, 손익, 수익률은 파생 값이다. holding에 중복 저장하지 않는다. valuation.total_value만 시점 재현을 위한 저장 파생 값이며 같은 행의 securities_value와 cash_balance/policy로 검증한다.
- PROVISIONAL 평가값·정책은 확정 전 수정 가능하다. 상태 전이는 PROVISIONAL → CONFIRMED만 허용하며 CONFIRMED는 값·정책·상태가 불변이다. PROVISIONAL로의 역전이 및 현재 가격에 의한 확정 평가 소급 수정은 금지한다. 확정값 정정 모델, confirmed_by/confirmed_at과 실제 강제 방식은 후속 결정이며 향후 정정 시 원본 보존과 정정본 선택 규칙이 함께 필요하다.
- market_price_snapshot은 단일 공급자의 (security_id, price_as_of_at)별 최신 성공 관측값이다. 같은 조합을 성공적으로 재수집하면 기존 price와 fetched_at을 갱신하며 신규 행이나 모든 재수집 전 값 이력을 만들지 않는다. 이 변경은 불변 제안의 복사값이나 CONFIRMED 평가에 전파하지 않는다.

## 키·nullability·무결성 계약

1. application-owned id는 불변 논리 surrogate key이며 DBML의 bigint는 물리 ID 생성 전략을 결정하지 않는다. 외부 auth_user.id는 Supabase Auth 소유의 UUID 참조다. 종목은 (market_code, ticker) listing 식별을 사용하고, 시장 코드 사전/상장변경 정책은 별도 확정한다.
2. 수량/매입가/제안금액/선택 실제금액은 음수가 아니다. 투입/계획/현금흐름 금액과 계산 가격은 양수다. 비중 단위는 퍼센트 문자열이 아닌 0..1 decimal 비율이다. 목표비중 총합, 소수 주식, 매도/잔여금 정책은 미확정이다.
3. funding.owner_member_id는 account.owner_member_id와 일치해야 한다. 연결된 plan은 같은 계좌여야 하고 funding_type은 REGULAR여야 한다. plan_id와 plan_occurrence_key는 둘 다 있거나 둘 다 없다. 연결된 회차 키는 보류 시 예정일을 바꾸더라도 유지한다. 같은 계획 회차 중복 생성은 논리 UNIQUE로 거부한다. plan 없는 REGULAR도 수동 등록을 표현할 수 있다. nullable UNIQUE의 DBMS 차이는 물리 단계에서 해결한다.
4. account의 currency_code는 초기 KRW다. holding 종목/제안 가격, 현금흐름 양쪽 계좌, valuation의 통화가 일치해야 한다. 환산 없이 다른 통화를 합산하지 않는다. FX 기능을 암묵적으로 지원하지 않는다.
5. 계획 종료일 null은 무기한이고 종료일은 시작일보다 빠를 수 없다. funding.processed_on은 COMPLETED/SKIPPED 처리 시 필수이며 실제 입출금일과 구분한다. INACTIVE로 바꿔도 기존 처리일을 삭제하지 않는다.
6. 기본값은 자동 생성하지 않는다. 생성 주체가 상태/활성 여부/시각을 명시해야 한다. date는 업무일, timestamp는 논리 instant다. 타임존 저장/업무일 경계/정밀도는 물리 단계에서 일관되게 결정한다.
7. 비활성 기준정보를 신규 계획/신규 투자에 선택하지 않지만 과거 FK 조회는 허용한다. 보유종목 재활성화는 새 중복 행을 만들지 않는다. 계좌/구성원이 비활성이라고 확정 현금흐름과 과거 평가를 집계에서 제거하지 않는다.
8. 동시 계획 회차 생성, 제안 set 저장, 결과 완료에는 UNIQUE뿐 아니라 관련 상태 검증과 원자적 저장이 필요하다. 잠금/낙관적 버전/격리 수준은 후속 구현 결정이다. FK 및 테이블간 조건의 물리 강제 방법도 이때 정한다.

## 상태 집합과 업무 흐름

- 기준정보/계획/현재 보유: is_active. 재활성화 권한, 자동 종료 처리, 비활성화 영향 범위는 후속 확정.
- funding_type: REGULAR(정기), ADDITIONAL(추가), ONE_TIME(일시). 월별 고유 키를 전체 투자 건에 걸지 않으므로 같은 달에 여러 유형/여러 건을 생성할 수 있다.
- funding.status: SCHEDULED(예정), AVAILABLE(사용가능), DEFERRED(보류), IN_PROGRESS(진행중), COMPLETED(완료), SKIPPED(건너뜀), INACTIVE(비활성).
- 대표 흐름: SCHEDULED → AVAILABLE → IN_PROGRESS → COMPLETED. 대기/진행 과정에서 DEFERRED로 보류하고 다시 진행할 수 있다. SKIPPED는 해당 회차만 종료하며 계획은 유지한다. 완료/건너뜀과 잘못 생성된 INACTIVE를 구분한다. 완료 후 재개/정정의 정확한 전이표는 미확정이다.
- result.status: PENDING, BUY_COMPLETED, SELL_COMPLETED, SKIPPED. terminal 결과에는 processed_on이 필요하다. 초기 생성 제안은 BUY이며 SELL 코드는 매도 이력 표현용 확장점이지 매도 알고리즘 승인이나 기능 구현이 아니다.
- valuation.status: PROVISIONAL → CONFIRMED 단방향 전이만 허용. PROVISIONAL은 수정 가능하고 CONFIRMED는 값·정책·상태 불변이며 역전이를 금지한다. 과거 연도 마지막 확정값에는 CONFIRMED만 사용한다.
- cash_flow.status: ACTIVE → VOIDED. VOIDED 원본의 사실 값과 참조는 보존하며 재활성화 대신 필요한 대체 사건을 새로 기록한다.
- 다시 투자하기는 새 funding.id를 생성한다. 원본 이력/제안/결과를 변경하거나 복제된 결과를 완료로 간주하지 않는다. 복사 기본값 범위는 미확정이다.

## 현금흐름: 원금의 단일 기준

investment_cash_flow 중 status=ACTIVE인 사건만 실제 순투입 원금 및 XIRR의 원천이다. VOIDED 사건은 성과·원금·XIRR 및 계좌별 유효 자금 이동 집계에서 제외하되 이력 조회에는 보존한다. funding.amount는 실행 예산, execution_result.applied_amount는 선택 실제 거래 정보다. 이 금액들을 cash_flow와 더하거나 완료 상태에서 외부 입금을 추정하지 않는다. 이미 계좌에 들어온 예수금으로 투자할 수 있으므로 funding과 cash_flow는 의도적으로 강제 1:1이 아니다.

한 현금흐름의 각 기록 버전은 한 행이며 amount는 양수 크기다. 정정 전후 버전은 원본 Ref로 연결하고 유효 집계에는 ACTIVE만 선택한다. flow_type과 endpoint 조건은 다음을 모두 만족해야 한다.

| flow_type | from_account_id | to_account_id | 전체/명의 외부 순투입 원금 | 외부 현금흐름 XIRR 부호 |
|---|---|---|---|---|
| EXTERNAL_INFLOW | null | 필수 | +amount | -amount |
| EXTERNAL_OUTFLOW | 필수 | null | -amount | +amount |
| INTERNAL_TRANSFER | 필수 | 필수, 출발과 다른 계좌 | 0 | 제외 |

- INTERNAL_TRANSFER는 같은 가계 안의 계좌 이동만 표현한다. 가계 경계를 넘는 사건은 양 가계의 별도 외부 사건으로 취급할지부터 승인해야 한다. 내부이체를 두 개의 외부 입출금 행으로 중복 등록하지 않는다.
- 두 계좌의 거래일/통화/이동금액은 한 행에서 공유한다. 계좌별 표시 시 동일 사건을 출발 -amount, 도착 +amount 두 표시 행으로 투영할 수 있지만, 이 표시 행을 원금 원천으로 재저장하거나 가계 합계에서 더하지 않는다.
- 명의/가계의 총 투자원금과 해당연도 투자액은 EXTERNAL 유형만 대상으로 한다. 계좌 간 이동은 명의가 달라도 외부 투자원금을 증가시키지 않는다. 명의가 다른 내부이체는 원래 외부 원금 귀속과 현재 보유 귀속을 달리 만들 수 있다. 이 경우 구성원별 XIRR/손익의 의미가 달라지므로, 수취 명의의 신규 외부 투자로 재분류하지 말고 해당 범위의 정확한 성과 계산을 정책 미확정으로 표시해야 한다. 증여/원금 귀속 이전 및 계좌 단위 boundary-XIRR은 후속 결정이다.
- funding_id가 있으면 외부 유입의 도착/외부 회수의 출발 계좌가 funding.account_id와 일치해야 한다. 내부이체 연결은 양 endpoint 중 funding 계좌를 지정한 사건만 허용한다. 연결은 출처 탐색용이지 금액 합산 근거가 아니다.
- source_event_key는 동일 사건 기록을 수동/수입/재시도 경로에서 공유하는 멱등 후보키다. VOIDED 이후에도 유일성을 유지하여 원본 재수입이 새 ACTIVE 사건이 되지 않게 한다. 명시적 대체 기록은 자체 key를 가지되 동일 정정의 재시도는 그 key를 재사용한다. 행 id를 새로 만들 때마다 임의 key로 중복을 허용하지 않는다. 실제 수입/거래원장 연동 전 원본과 정정 기록을 구분하는 키 생성/충돌 규칙을 승인해야 한다.
- cash_flow에는 실제 확정 사건만 기록한다. SKIPPED/DEFERRED 투자 계획 금액을 넣지 않는다. 투자 건의 비활성화만으로 실제 입금을 제거하지 않는다. 잘못 기록된 사건은 아래 원본 보존 정책으로만 정정한다.

### FTR-206 수정·비활성화와 원본 보존

1. 등록은 명시적 ACTIVE 사건과 필수 recorded_by를 생성한다. 비활성화는 잘못된 원본을 VOIDED로 전환하는 업무 무효화이며 물리 삭제나 금액 덮어쓰기가 아니다. recorded_by를 보존하고 voided_at과 voided_by는 VOIDED일 때 필수, ACTIVE일 때 null이다. void_reason은 무효화 사유를 보존하는 선택 필드이며 필수화/사유 코드 목록은 이번 승인에 포함되지 않는다.
2. 잘못 기록된 현금흐름의 수정은 원본을 VOIDED로 보존하고 필요한 경우 새 ACTIVE 사건을 추가한다. 대체가 필요 없는 무효화는 새 사건 없이 종료한다. 반대 방향 외부거래를 자동 삽입하지 않는다. 실제로 발생한 회수는 정정과 달리 독립 EXTERNAL_OUTFLOW다.
3. 대체 행의 correction_of_cash_flow_id는 보존된 VOIDED 원본 하나의 id를 참조한다. 정정이 아닌 최초 사건은 null이다. 새 행은 실제 거래일·금액·흐름 방향·endpoint·통화를 명시하고 각 사건의 endpoint/통화/가계 불변식을 다시 만족해야 한다. 원본의 값을 덮어쓰거나 방향/통화를 암묵적으로 상속하여 변경을 숨기지 않는다.
4. 자기 참조/순환은 정정 이력이 아니다. 재정정은 현재 유효한 대체 사건을 다시 무효화하고 새 사건이 그 직전 원본을 참조하는 이력으로 해석한다. 원본 무효화와 대체 등록 사이에 양쪽이 함께 ACTIVE로 집계되지 않도록 일관된 효력 전환이 필요하다. 관련 검증과 원자적 저장의 물리 CHECK/FK/잠금/격리 방식은 별도 MIGRATION에서 결정한다.
5. correction_of_cash_flow_id는 후보키가 아닌 선택 논리 관계다. 이번 승인에는 원본당 대체 수의 UNIQUE 제약이 없으므로 DBML은 원본 1 : 참조 행 0..N, 대체 행 : 원본 0..1을 표현한다. 분할 대체나 복수 ACTIVE 대체를 허용하는 업무 정책을 이 cardinality만으로 추정하지 않는다. 원본당 대체 수 제한과 동시 정정 충돌 정책은 후속 확정하며, 미확정 분기 정정을 지원한다고 주장하지 않는다.
6. FTR-206의 동일 가계 조회와 당사자만 등록·수정·비활성화하는 권한은 그대로다. VOIDED도 이 권한 경계 안에서 조회한다. endpoint 변경으로 귀속이 달라지는 정정의 권한 검증 역시 향후 application 책임이며 이 논리 Ref가 권한을 구현한 것은 아니다.
7. funding.INACTIVE, 계좌/구성원 is_active=false는 cash_flow 무효화가 아니다. 이들 상태 변경만으로 ACTIVE 실제 입출금을 집계에서 제거하지 않는다. 반대로 cash_flow 무효화는 funding/제안/결과나 CONFIRMED 평가 snapshot을 자동 수정하지 않는다.

성과 조회는 현재 유효한 ACTIVE 사건을 occurred_on 기준으로 선택하므로 과거 날짜의 정정은 해당 연도 원금·성과·XIRR 입력에도 반영된다. recorded_at/voided_at을 XIRR 거래일로 쓰지 않는다. 과거 조회 당시의 결과를 그대로 재생하는 별도 시점별 정정 버전 조회 계약은 이번 범위가 아니다. 평가 snapshot은 기존 확정값/현금 포함 정책을 유지하며 현금흐름 정정을 이유로 최신 가격으로 덮어쓰지 않는다.

## 연도별 성과와 XIRR 추적

| 요구사항/계산 입력 | 원천과 선택 계약 |
|---|---|
| FTR-201 명의/계좌 | account.owner_member_id → household_member, account_type/institution_name/account_name |
| FTR-202~205 보유/현재 평가/배분 | holding.quantity/average_purchase_price/target_allocation + 마지막 성공 market_price_snapshot. 현재가 × 수량은 파생 값. |
| FTR-206 거래일·명의·금액·유형 및 수정·비활성화 | cash_flow.occurred_on/amount/flow_type/endpoints → account.owner_member_id. VOIDED 원본과 correction_of_cash_flow_id 연결을 이력에 보존하고 집계는 ACTIVE만 선택. |
| 해당연도 투자액 및 연도·계좌별 유입 합계 | ACTIVE 중 해당 연도 occurred_on의 EXTERNAL_INFLOW 합계 - EXTERNAL_OUTFLOW 합계. endpoint로 계좌 및 명의를 선택. 내부이체 표시 통계는 별도. |
| 총 투자원금 | ACTIVE 중 조회 기준일 이하의 외부 순유입 누계. 현재 보유원가나 funding 총액으로 대체하지 않는다. |
| FTR-207 연초 평가액 | 직전 연도의 마지막 CONFIRMED valuation.total_value. 최초 투자 연도만 0. 누락된 중간연도 평가를 첫해처럼 0으로 대체하지 않는다. |
| 과거 연말 평가액 | 해당 연도 마지막 CONFIRMED snapshot; as_of_at으로 순서 결정하고 captured_at으로 대체하지 않는다. |
| 현재 연도 평가액 | 조회 cutoff 이하 최신 평가값. PROVISIONAL 포함 시 미확정임을 표시하고 과거 확정값으로 취급하지 않는다. |
| FTR-208 XIRR 날짜/금액 | ACTIVE 실제 외부 cash_flow.occurred_on과 위 부호, 기준일의 총 평가액을 최종 양수 현금흐름으로 추가. processed_on/예정일/voided_at을 대신 쓰지 않는다. |
| 예수금 포함 정책 | valuation.securities_value/cash_balance/cash_inclusion_policy/total_value를 함께 보존. |

계좌 평가의 합산은 동일 기준시점·통화·현금 포함 정책과 대상 계좌 집합으로 수행한다. 일부 계좌 스냅샷 누락 또는 서로 다른 날짜를 조용히 혼합하여 완전한 가계 평가로 표시하지 않는다. 계좌 개설/종료를 포함한 집합의 역사적 결정과 snapshot 배치 시점은 후속 확정해야 하며, 현재 논리 모델만으로 자동 스케줄링이나 완전한 과거 데이터가 생기지는 않는다.

연간 성과는 기준 투자금액 = 연초 평가액 + 해당연도 외부 순투입액, 연간 수익률 = (연말/현재 평가액 - 기준 투자금액) / 기준 투자금액이다. 이는 Excel 호환 단순 성과율로 XIRR/TWR과 별개다. 총 수익률은 (현재 평가액 - 총 투자원금) / 총 투자원금이다. 분모가 0이면 계산 불가/표시 정책을 적용하고 무조건 나누지 않는다.

XIRR은 최소 양수/음수 흐름과 유효 날짜가 필요하다. 유효 부호 부족/해 없음/비수렴은 계산 불가로 처리한다. 실제 알고리즘/해 선택/허용오차는 후속 계산 구현에서 검증한다. 현금흐름 원문 없이 제품 문서의 Excel 예시 XIRR 수치를 재현했다고 주장하지 않는다.

## 정밀도·가격·호환성

금액/수량/비율은 논리 decimal, 서버 계산은 제품 요구사항의 BigDecimal 책임이다. DB DECIMAL/NUMERIC precision/scale, overflow, 나눗셈 rounding mode, 표시 소수 자릿수는 DBMS 및 계산식 확정 후 정한다. Float/Double 전환, 임의 저장 반올림, 음수 금액으로 방향 중복 표현을 하지 않는다.

가격 관측은 경제적 기준시각과 가져온 시각을 구분한다. 공급자는 하나이며 (security_id, price_as_of_at)은 논리 UNIQUE다. 같은 조합의 성공 재수집은 새 행 대신 기존 price와 fetched_at을 갱신한다. 종목·기준시각별 최신 성공 관측값만 보존하므로 과거 재수집 전 값 전체를 복원할 수는 없다. 조회 실패는 기존 성공 가격을 덮어쓰지 않으며 마지막 성공 가격과 그 시각을 표시한다. 미래 기준시각의 가격을 과거 기준시각의 가격으로 대체하지 않는다. 공급자 선정, 실패/stale 허용시간, 가격 보존기간과 실제 upsert·동시성 강제는 후속 결정이며 다중 공급자는 이번 범위가 아니다. 제안은 가격을 직접 고정하므로 재수집/가격 이력 삭제가 제안 해석에 영향을 주지 않으며 CONFIRMED 평가도 변경하지 않는다. 삭제 정책 자체는 아직 승인되지 않았다.

현재 배포할 DDL이나 backfill은 없다. identity의 외부 인증 참조와 사용자 수행 actor는 확정하되 DBMS 및 물리 매핑·삭제 정책 확정 후 물리 스키마, 무결성 제약, migration, 기존 자료 가져오기 및 중복키/평가 데이터 충족 검증을 별도 진행한다. 현재 문서로 JPA Entity, DB index, API 필드명을 고정하지 않는다.

## Use Case 검토와 검증 경계

| 시나리오 | 논리 검토 결과 |
|---|---|
| 활성 가계 생성·재활성화 | household의 명시적 활성·생성/변경 시각과 소속 활성 OWNER 최소 한 명 조건을 함께 충족해야 함. 원자적 생성/변경 강제는 후속. |
| 최초 인증/온보딩 및 provisioning 재시도 | auth.users.id로 app_user 생성·조회. auth_user_id 논리 UNIQUE이며 중복·동시 요청 처리와 기존 자료 backfill 구현은 후속. app_user 생성에 created_by/updated_by를 강제하지 않음. |
| 공통 사용자 표시명 변경·provisioning 재조회 | app_user.display_name을 모든 가계에서 공통 사용. Auth metadata를 복제·동기화하지 않으며 최초 created_at 보존. 가계별 별칭/과거 표시명 snapshot 없음. |
| 같은 내부 사용자의 다중 가계 참여 | 서로 다른 household_id에 별도 멤버십 행을 허용. household_member.app_user_id 단독 UNIQUE 없음. |
| 같은 가계의 동일 내부 사용자 중복 등록 | 비활성 포함 (household_id, app_user_id) 논리 UNIQUE로 금지. |
| 역할 변경·마지막 활성 OWNER 비활성화·탈퇴 | 활성 가계의 활성 OWNER 최소 한 명을 유지해야 함. 동시 변경의 강제 방식은 후속이며 역할 변경이 계좌 명의를 바꾸지 않음. |
| 가계 비활성화 | 멤버십·계좌·투자 이력과 현금흐름·평가 집계를 보존하며 자식 삭제를 유발하지 않음. |
| Auth soft delete·재가입·프로필 변경 | 탈퇴 기본 정책은 Supabase Auth soft delete, app_user/멤버십/투자 귀속 이력/audit actor 비-cascade 및 Auth 비복사 유지. 재가입 UUID/새 app_user 발급·멤버십 자동 복구는 미확정이고 계정 복구를 보장하지 않음. 실제 호출·로그인 차단·비식별화·인가 구현은 후속. |
| 같은 달 정기+추가+일시 투자 | funding 유형은 공통 구조, 계획 연결은 선택. 전체 월 UNIQUE 없음. |
| 반복 회차 중복/보류 재시도 | plan_occurrence_key 고정 및 계획-회차 UNIQUE 의도. 정확한 일정 encoding/동시성 구현은 후속. |
| 한 회차 건너뛰기/계획 종료 | funding SKIPPED는 계획을 종료하지 않고, 계획 비활성화는 과거 funding을 유지. |
| 사용자 수행 가변 업무 행 7종 생성/변경/재활성화 | 필수 created_at/updated_at 및 created_by/updated_by. 생성 시 시각 쌍과 actor 쌍은 각각 같고 최초 생성 시각/생성자를 보존하며 마지막 변경 시각/변경자를 갱신. 과거 값·전체 actor 변경 이력은 미지원. |
| 시스템 종목 생성·갱신 | security_instrument의 생성/변경 시각은 유지하되 created_by/updated_by 및 app_user actor Ref 없음. system actor 테이블 추가 없음. |
| 명의자와 다른 사용자의 허용 변경 | actor는 인증 요청 수행자의 app_user.id로 기록하고 owner_member_id → household_member.id는 유지. actor Ref 자체가 변경 권한을 부여하지 않음. |
| 자동/불변 snapshot 및 인증 요청 없는 배치 | snapshot 3종에 actor를 추가하지 않음. 필수 actor 테이블의 배치 쓰기는 임의 system user로 우회하지 않으며 별도 DESIGN 필요. |
| 가격 갱신/보유수량 보정 | 제안의 복사값과 평가 snapshot은 변경되지 않음. 종목 기준의 updated_at은 가격 갱신 시각이 아니며 과거 holding 수정값 이력은 아직 미지원. |
| 동일 종목·기준시각 성공 재수집/실패/동시 수집 | 단일 공급자와 복합 UNIQUE, 성공 시 기존 price/fetched_at 갱신, 실패 시 기존 성공값 보존. 전체 재수집 전 값 이력 없음. 실제 upsert·동시성 구현은 후속. |
| 평가 검토·확정·역전이 시도 | PROVISIONAL 수정 허용, PROVISIONAL → CONFIRMED만 허용. CONFIRMED 값·정책·상태 변경과 역전이 금지. 정정 모델·confirmed_by/confirmed_at·강제 방식은 후속. |
| 종목 제안 추가/재계산 및 결과 중복 | 새 immutable set, set 내 종목 UNIQUE, 결과 suggestion UNIQUE; 완료 set 교체 금지. |
| 동일 명의/다른 명의 내부이체 | 단일 사건의 endpoint 검증, 외부 순투입 집계 제외. 타 명의 성과 귀속 미확정은 계산 제한으로 노출. |
| 외부 회수/분할 입금 | 실제 사건별 cash_flow 및 날짜 보존, funding과 강제 1:1 아님. |
| 잘못된 사건 무효화/금액·날짜 수정 | VOIDED 원본과 recorded_by를 보존하고 voided_by 기록. 필요 시 자체 recorded_by와 null voided_by를 가진 새 ACTIVE 대체 및 원본 Ref. VOIDED는 원금·성과·XIRR 제외, 실제 회수와 구별. |
| 정정 시 방향·endpoint·통화 변경 | 새 사건에 명시하고 사건별 endpoint/통화/가계 규칙 재검증. 내부이체로 정정되면 외부 원금/XIRR 입력에서 제외. FX 신규 지원 아님. |
| 무효화 후 재수입/정정 재시도·동시 요청 | VOIDED를 포함한 source_event_key 유일성 유지. 재시도 key 공유, 원본·대체 효력의 원자적 전환 필요. 분기/동시 충돌 상세 정책과 강제 구현은 후속. |
| 과거/현재 평가 및 첫해/누락연도 | 확정여부·기준시각·현금정책 분리; 누락 데이터는 완전한 결과로 간주하지 않음. |
| 비활성화/다시 투자/종료 | 과거 참조 보존, 새 실행 id, 무단 물리 삭제 없음. |
| 대량 목록/성과 조회 | funding 날짜·유형·계좌·상태 필터, 현금흐름 날짜·endpoint 집계, 평가 cutoff 조회 의도. 데이터 규모/실행계획 없이 물리 index를 추정하지 않음. |

자동 검증 명령: `python3 /opt/custom-skills/shared/dev-data-modeling/scripts/dbml_guard.py --path docs/data/schema.dbml --mode logical --require-subject-area`.

이 guard는 완전한 DBML parser가 아니다. top-level Ref의 테이블/컬럼 존재 및 문서 링크를 별도 확인한다. 프로젝트에는 DBML parser/CI가 없으므로 full syntax parser와 DBML Canvas 렌더링은 NOT_RUN이다. Gradle compile/test는 application 변경이 없어 NOT_REQUIRED다. 위 표는 설계 검토이지 실행 DB 제약/성과 계산 테스트 PASS가 아니다.

Task t_f134f3b2 검증에서 --require-subject-area logical guard는 exit 0, STATUS=pass, TABLE_COUNT=11, REF_COUNT=16, SUBJECT_AREA_COUNT=3을 반환했다. MSSQL 토큰 경고는 notes의 일반 영어 `identity`를 포함한 문자열 탐지 경고이며 실제 vendor 생성 옵션은 사용하지 않았다. 작업 시작본과의 보조 구조 대조로 승인된 6개 테이블의 필수 timestamp 10개 추가만 있고 기존 컬럼·키·nullability는 변하지 않았음을 확인했다. 기존 investment_funding을 포함한 가변 업무 테이블 7개는 created_at/updated_at을 모두 가지며, 원장과 snapshot 본문은 변경되지 않았다. 기존 Ref 16개(현금흐름 self Ref 포함)와 TableGroup 3개는 그대로이며 모든 Ref 양쪽 컬럼 존재와 테이블당 단일 영역 소속, 문서 상대 링크 5개와 DBML companion 참조를 확인했다.

FTR-201~208과 제품 성과 명세를 대조하여 계획 회차 중복 방지, 완료 proposal set 제한, cash_flow의 단일 원금 원천/내부이체 제외, ACTIVE 선택, 실제 occurred_on과 XIRR 부호, 확정 평가/as_of_at/현금 포함 정책 불변식을 유지했다. FTR-901/902의 공통 선택값·관리자 권한 요구는 별도 마스터 통합 승인 대상으로 유지한다. 현금흐름/XIRR 및 코드값 계약 본문도 작업 시작본과 동일함을 확인했다. 이는 문서·논리 구조 검증이며 실행 DB 제약이나 XIRR 수치 테스트 결과는 아니다.

Task t_79f7c7f5 검증에서 logical guard는 exit 0, STATUS=pass, TABLE_COUNT=11, REF_COUNT=16, SUBJECT_AREA_COUNT=3을 반환했다. MSSQL 토큰 경고는 guard의 일반 영어 `identity` 탐지에 해당하며 물리 생성 옵션을 추가하지 않았다. Auth 참조 UUID·복합 UNIQUE와 두 문서의 사용자/멤버십 책임·비복사·비-cascade·후속 인가 경계가 일치하고, 기존의 멤버십 유일성 미확정 문구를 제거했음을 확인했다. 문서 상대 링크 5개 및 DBML companion 파일의 존재 확인은 exit 0이었다. 이 결과는 논리 문서 검증이며 실제 UNIQUE/FK/RLS나 계정 삭제 동작을 실행 검증한 것이 아니다.

Task t_d91bc9db 검증에서 동일 logical guard는 exit 0, STATUS=pass, TABLE_COUNT=12, REF_COUNT=17, SUBJECT_AREA_COUNT=3을 반환했으며 경고는 없었다. 작업 시작본과 Note를 제외한 구조를 대조하여 household 추가, household_ref → household_id 대체(논리 bigint 및 조합 UNIQUE), 필수 role 추가, 가계 Ref 하나 및 household 영역 소속 추가만 있음을 확인했다. 기존 투자 컬럼·타입·nullability·키와 Ref 16개는 보존했다. 전체 테이블 12개의 한글 논리명/설명 문단과 컬럼 120개의 한글 논리명 시작 Note, 모든 Ref 양쪽 컬럼, 테이블당 단일 영역 소속, 가변 업무 테이블 8개 및 문서 상대 링크 5개를 보조 검사로 확인했다. Current/History/Snapshot/Derived, 현금흐름, 연도별 성과/XIRR, 정밀도·가격 계약 본문은 시작본과 동일하며 가계·현재 역할·Auth 경계를 두 문서에 일치시켰다. 대상 두 파일의 `git diff --check`는 exit 0이었다. 이 결과는 정적 논리 문서 검증이며 full DBML parser, Canvas와 실제 DB/FK/UNIQUE/RLS/동시 역할 변경 실행 검증은 NOT_RUN이다.

Task t_15d4cc3d 검증에서 동일 logical guard는 exit 0, STATUS=pass, TABLE_COUNT=13, REF_COUNT=36, SUBJECT_AREA_COUNT=4를 반환했다. MSSQL 토큰 경고는 guard의 `\bidentity\b` 탐지가 승인된 identity TableGroup 이름과 주석에 반응한 것이며 물리 ID 생성 옵션을 추가한 결과가 아니다. 작업 시작본과의 보조 구조 대조는 exit 0으로, 외부 auth_user의 id만 추가하고 기존 8개 가변 업무 테이블의 필수 actor 16개 및 현금흐름 actor 2개를 추가했음을 확인했다. 기존 컬럼의 타입·키·nullability와 indexes, 기존 Ref 17개 및 owner_member_id 참조는 보존되었으며 신규 Auth Ref는 19개다. snapshot 3종 본문은 시작본과 동일하다. 전체 테이블 13개·컬럼 139개의 한글 Note, 모든 Ref 양쪽 컬럼, 테이블당 단일 주제영역 소속과 문서 상대 링크 5개도 확인했다. 기존 Current/History/Snapshot/Derived·연도별 성과/XIRR·기준 엔티티/코드값 계약 본문은 동일하다. 대상 두 파일의 `git diff --check`는 exit 0이었다. 이는 정적 논리 문서 검증이며 full DBML parser, DBML Canvas Manual Review와 실제 DB/FK/인가/actor 전달·삭제 실행 검증은 NOT_RUN이다.

Task t_cc25cd7f 검증에서 동일 logical guard는 exit 0, STATUS=pass, TABLE_COUNT=14, REF_COUNT=37, SUBJECT_AREA_COUNT=4를 반환했다. MSSQL 토큰 경고는 승인된 identity 주제영역 이름·주석에 대한 기존 문자열 탐지이며 물리 생성 옵션은 추가하지 않았다. 작업 시작본과의 보조 구조 대조는 exit 0으로 app_user의 내부 PK·필수 외부 UUID UNIQUE 추가, 멤버십 필수 app_user_id와 조합 UNIQUE 전환, actor 18개의 bigint 및 app_user.id 참조 전환만 확인했다. 기존 컬럼의 필수/선택 의미, 나머지 키와 관계, owner_member_id 참조를 보존했다. snapshot 3종 본문과 기존 투자 불변식 6개 절은 시작본과 동일하다. 모든 Ref 양쪽 컬럼의 존재·타입 일치, 테이블당 단일 영역 소속, 한글 Note, 문서 상대 링크 5개 및 provisioning·내부 actor·비-cascade 문서 계약을 확인했다. 대상 두 파일의 git diff --check는 exit 0이었다. 이는 정적 논리 문서 검증이며 full DBML parser, DBML Canvas Manual Review, 실제 DB 제약·provisioning·JWT actor 전달·삭제·backfill 실행 검증은 NOT_RUN이다. 애플리케이션 변경이 없어 compile/test는 NOT_REQUIRED다.

Task t_cba24c92 검증에서 동일 logical guard는 exit 0, STATUS=pass, TABLE_COUNT=14, REF_COUNT=35, SUBJECT_AREA_COUNT=4를 반환했다. 기존 MSSQL 계열 토큰 경고는 유지되며 vendor-specific 물리 옵션은 추가하지 않았다. 시작본 대비 보조 구조 검사는 exit 0으로 app_user 필수 created_at/display_name 추가, household_member.display_name 제거, security_instrument actor 컬럼·Ref 제거 및 market_price_snapshot 복합 UNIQUE 추가만 확인했다. 전체 컬럼 140개, 사용자 actor Ref 16개와 모든 Ref 양쪽 컬럼·타입, 한글 Note, 주제영역 및 문서 링크를 확인했다. 비대상 테이블 본문, owner_member_id 관계, 실행 결과 suggestion_id 구조, 현금흐름·정정·연도별 성과/XIRR·기존 무결성 계약은 시작본과 동일하다. 두 문서의 soft delete 비-cascade·재가입 미확정·공통 표시명·시스템 종목·평가 단방향 확정·단일 공급자 가격 재수집 계약을 대조했고 대상 파일의 git diff --check는 exit 0이었다. 이는 정적 논리 문서 검증이다. full DBML parser/DBML Canvas, 실제 Supabase soft delete·로그인 차단, PostgreSQL upsert/FK/RLS/migration 및 애플리케이션 실행 테스트는 NOT_RUN이며 이번 DESIGN 범위에서 구현하지 않았다.

## 후속 결정 목록

- DBMS/version, ID 물리형/생성, FK/삭제 정책, nullable UNIQUE와 교차 행 조건 강제, 시간/타임존, precision/scale.
- app_user.auth_user_id → auth_user.id, 멤버십·audit actor → app_user.id 및 household.id에 대한 실제 FK, 구성원 이동·탈퇴·재가입·공동 소유, 명의 이전과 이력 귀속. auth_user의 외부 소유권, app_user의 내부 PK, auth_user_id UNIQUE, 동일 가계·내부 사용자 조합 유일성과 다중 가계 참여는 확정이며 물리 강제 방식은 후속이다.
- 최초 인증/온보딩 provisioning의 생성·조회·중복/동시 요청 처리와 기존 Auth UUID의 내부 사용자 매핑, 멤버십·actor backfill. 내부 사용자 식별자 생성 방식과 외부 인증 연결의 변경·비식별화 정책을 추측하지 않는다.
- 시스템 생성·갱신 security_instrument는 actor 제외가 확정이며 system actor 테이블은 추가하지 않는다. 나머지 필수 actor 테이블의 system/batch 쓰기는 별도 DESIGN 대상. JWT actor 전달·검증, 기존 자료의 actor 확보/backfill은 후속 애플리케이션/보안·MIGRATION 결정이며 임의 system user나 DB default로 대체하지 않는다.
- 활성 가계의 활성 OWNER 최소 한 명 보장에 대한 동시 role 변경·비활성화·Auth 탈퇴 연계와 원자적 검증·DB 제약. OWNER / EDITOR / VIEWER는 현재 구분만 승인되었으며 세부 권한표·역할 이력·RLS는 후속이다.
- Supabase Auth soft delete 기본 정책의 실제 설정/deleteUser 호출·로그인 차단·비식별화 lifecycle, 이력 비-cascade 원칙을 만족하는 실제 FK delete action/trigger, RLS/서버 인가와 가계별 접근 격리 검증. 재가입 Auth UUID/새 app_user 발급과 기존 멤버십 자동 복구는 미확정이며 기존 계정 복구를 보장하지 않는다.
- 계좌 유형 기준정보 연결, listing 변경, 외화/환율, 배당/수수료/세금과 계좌 경계 밖 이체.
- 반복 규칙 encoding, 휴일/월말/재알림, 계획 변경 후 미처리 회차 처리, 복사 기본값.
- 목표비중 합계/배분식, 잔여 예수금/소수 주식, 매도 모드, 제안 알고리즘 버전과 완전한 입력 재현 범위.
- 보유 보정 전 값/상태 전이 audit, 완료 후 결과 정정, 비활성/재활성 상세 정책. 현금흐름은 본문의 원본 보존형 무효화·대체 정책을 적용하되 원본당 대체 수/분기 및 동시 충돌 상세 정책, 사유 필수화는 후속 확정.
- source_event_key 생성/중복 검증과 다른 거래원장 연동, 명의간 이체의 성과 귀속 및 계좌별 boundary-XIRR.
- 단일 가격 공급자의 선정/보존기간/stale 기준과 (security_id, price_as_of_at) UNIQUE·재수집 갱신의 실제 upsert/동시성 강제. 다중 공급자는 범위 밖이다.
- snapshot 생성 주기/확정 주체/대상 계좌 집합과 누락 복구. 평가 PROVISIONAL 수정 가능·CONFIRMED 값/정책/상태 불변·단방향 전이는 확정이며 확정값 정정 모델·정정본 선택, confirmed_by/confirmed_at과 실제 강제 방식은 후속이다.
- 실제 DB/성능/수치 회귀 테스트, Excel 현금흐름 원천 검증, DBML Canvas Human Review.

## 작업 단위 인계

- Work Unit Class: DESIGN / Work Unit Boundary: SPLIT_REQUIRED
- Physicalization Required: YES / Follow-up Required: YES
- Follow-up Work Unit: MIGRATION
- Follow-up Input: 승인된 docs/data/schema.dbml 및 본문의 identity/household/investment/market 주제영역·관계·업무 불변식과 외부 auth_user·내부 app_user·공통 표시명·최초 provisioning 시각·사용자 수행 actor·시스템 종목·명의 귀속·Auth soft delete 비-cascade·평가 확정·단일 공급자 가격 재수집·인가 경계
- Excluded Follow-up Scope: DBMS 선택, DDL, Flyway/Liquibase, 물리 table/type/index/constraint, JPA mapping, Supabase Auth 설정/deleteUser 호출, FK/delete action/RLS/trigger/backfill, provisioning·탈퇴·재가입·JWT actor·표시명 UI 및 기타 API/application/frontend 구현, 운영 DB 변경

이번 작업은 논리 DBML과 companion 문서만 구체화한다. 후속 물리화는 사용자의 별도 Standard Flow 요청으로 진행하며 DESIGN 완료만으로 MIGRATION 카드를 자동 생성하거나 실행하지 않는다.

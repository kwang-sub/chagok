# SCR-011 부채 관리

Status: APPROVED

Reference: `./reference.png`

Legacy detail: `docs/product/screens/SCR-011-debt-management.md`

## Design Reference

승인 기준 이미지는 **부채 관리 규격서 최종 시안**이다.

핵심 시각 요소:
- 총 부채 / 이번 달 상환액 / 월 이자 부담 KPI
- 부채 유형별 Donut
- 부채 잔액 추이 Line Chart
- 필터/검색
- 부채 목록 테이블
- 상세 Drawer
- 등록/수정 Modal
- Mobile 상세/등록/수정 화면

## Viewport

- Desktop: reference의 PC 화면 기준
- Mobile: reference의 모바일 화면 기준

## 화면 목적

가계의 부채 현황과 상환 부담을 한눈에 파악하고 부채별 상세 정보와 남은 원금을 관리한다.

## 주요 상태

- 상환중
- 완납
- 비활성화
- loading
- empty
- error

## Responsive

- Desktop: KPI + 차트 + 테이블 + Drawer/Modal
- Mobile: 요약 + Donut + 카드형 부채 목록 + 별도 상세/등록/수정 화면

## Interaction

- 가계/구성원 조회 범위 변경
- 부채 유형/금융기관/상태 필터
- 부채 상세 조회
- 본인 부채 등록/수정/비활성화
- 다른 구성원 부채는 조회만 허용

## Data / API Dependency

- debt summary
- debt allocation
- debt trend
- debt list/detail
- debt create/update/deactivate

## Acceptance Criteria

- `reference.png`의 KPI, 차트, 테이블, Drawer/Modal 구조를 유지한다.
- 삭제 대신 비활성화 정책을 사용한다.
- 원 단위 금액을 반올림하지 않는다.
- 같은 가계 구성원의 상세 조회는 허용하되 변경 권한은 당사자에게만 부여한다.
- PC/Mobile 및 주요 상태를 검증한다.

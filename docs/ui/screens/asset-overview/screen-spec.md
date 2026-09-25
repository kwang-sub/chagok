# SCR-010 자산 현황

Status: APPROVED

Reference: `./reference.png`

Legacy detail: `docs/product/screens/SCR-010-asset-overview.md`

## Design Reference

승인 기준 이미지는 사용자가 두 시안 중 선택한 **자산 요약 + 계좌별 목록 탭 기반 시안**이다.

핵심 시각 요소:
- PC 좌측 사이드바
- 자산 요약 / 계좌별 목록 탭
- 총자산 / 금융자산 / 실물자산 / 기타자산 KPI
- 자산 구성 비율 Donut
- 자산 추이 Line Chart
- 자산 유형별 카드형 목록
- Mobile 자산 요약 / 계좌별 목록 탭
- Mobile 자산 구성 Donut + 유형별 Accordion/List

## Viewport

- Desktop: reference의 PC 프레임 기준
- Mobile: reference의 모바일 프레임 기준

## 화면 목적

가계 전체 또는 구성원별 자산을 유형별로 조회하고, 세부 자산과 계좌를 탐색한다.

## 주요 상태

- populated
- loading
- empty
- error
- stale-price: 시세 조회 실패 시 마지막 정상 가격과 기준시각 표시

## Responsive

- Desktop: KPI + 차트 + 유형별 카드/목록
- Mobile: 핵심 요약 우선, 유형별 목록 세로 배치

## Interaction

- 가계/구성원 범위 변경
- 자산 유형 필터
- 목록/카드 보기 전환(지원 범위 내)
- 자산 상세 열기
- 자산 등록/수정
- 비활성화
- 새로고침/시세 갱신

## Data / API Dependency

- asset summary
- asset allocation
- asset trend
- asset list
- asset detail
- market price metadata

초기 구현에서는 투자와 연결된 투자자산만 실제 데이터 사용을 우선하고 다른 자산 유형은 fixture/mock 사용을 허용한다.

## Acceptance Criteria

- `reference.png`와 동일한 탭 구조와 정보 hierarchy를 유지한다.
- Donut/Line Chart를 실제 chart component로 구현한다.
- 자산 금액은 반올림하지 않는다.
- 시세 기반 자산은 데이터 기준시각을 식별할 수 있어야 한다.
- PC/Mobile 모두 Design Conformance 검증 대상이다.

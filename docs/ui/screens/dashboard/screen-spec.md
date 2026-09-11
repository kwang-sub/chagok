# SCR-001 홈 대시보드

Status: APPROVED

Reference: `./reference.png`

Legacy detail: `docs/product/screens/SCR-001-home-dashboard.md`

## Design Reference

승인 기준 이미지는 **카드 실적이 포함된 최종 차곡 대시보드 시안**이다.

핵심 시각 요소:
- PC 좌측 고정 사이드바
- 순자산 Hero + 차곡 계단 일러스트
- 총자산 / 총부채 / 가용자금 KPI
- 지난달 → 이번달 순자산 추이
- 이번 달 현금흐름
- 투자 포트폴리오 요약
- 이번 달 지출 요약
- 카드 실적 가로 Carousel
- Mobile 하단 탭과 카드 실적 Swipe

## Viewport

- Desktop: reference의 PC 프레임 기준
- Mobile: reference의 모바일 프레임 기준
- 구현 시 Desktop/Mobile 모두 지원

## 화면 목적

가계의 현재 재무상태와 최근 변화를 앱 진입 직후 한눈에 확인한다.

## 주요 상태

- populated
- loading: 영역별 Skeleton
- empty: 최초 자산 등록 유도
- partial-data: 일부 외부 시세 실패 시 정상 영역 유지
- error: 재시도 가능한 오류 안내

## Responsive

- Mobile First
- Desktop: 사이드바 + 다열 카드 레이아웃
- Mobile: 세로 스크롤 + 하단 탭
- 카드 실적: Desktop Carousel / Mobile Swipe

## Interaction

- 총자산 → SCR-010
- 총부채 → SCR-011
- 순자산 추이 → SCR-012
- 투자 요약 → SCR-020
- 지출 요약 → SCR-030
- 현금흐름 → SCR-040
- 카드 실적 → SCR-032
- 가계/구성원 조회 범위 변경

## Data / API Dependency

실제 API 계약은 구현 단계에서 확정하되 다음 조회 모델이 필요하다.

- dashboard summary
- net worth comparison
- monthly cash flow
- investment summary
- expense summary
- card performance

초기 구현에서 투자 영역은 실제 데이터, 아직 구현하지 않은 영역은 동일 DTO 구조의 fixture/mock 사용을 허용한다.

## Acceptance Criteria

- `reference.png`의 정보 구조와 visual hierarchy를 유지한다.
- 차곡 계단 Hero, 차트, 카드 실적을 텍스트 placeholder로 대체하지 않는다.
- PC/Mobile 두 화면을 모두 구현한다.
- 금액을 임의 반올림하지 않는다.
- Repository의 기존 design token / 공통 component가 있으면 우선 재사용한다.
- 최초 구현 완료 시 Design Conformance 검증과 Human Review를 수행한다.

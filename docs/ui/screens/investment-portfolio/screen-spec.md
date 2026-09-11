# SCR-020 투자 포트폴리오

Status: APPROVED

Reference: `./reference.png`

Legacy detail: `docs/product/screens/SCR-020-investment-portfolio.md`

## Design Reference

승인 기준 이미지는 **투자금 투입 관리가 포함된 최종 투자 포트폴리오 화면 설계 보드**이다.

핵심 시각 요소:
- PC 좌측 사이드바
- 포트폴리오 / 투자금 투입 / 계좌별 / 종목별 / 성과 분석 탭
- 총 평가금액 / 총 투자원금 / 평가손익 / 연환산 수익률 KPI
- 정기 투자일 안내 및 `투자하기 / 보류 / 건너뛰기`
- 추가 납입 진입점
- 자산 배분 Donut
- 평가금액/수익률 추이 Line Chart
- 보유 종목 테이블
- 최근 투자금 투입 내역
- 다음 예정 투자금
- Mobile 홈 투자 알림, 투자하기, 보유종목, 종목 상세

## Viewport

- Desktop: reference의 PC 화면 기준
- Mobile: reference의 각 Mobile 프레임 기준

## 화면 목적

보유 투자자산의 평가현황과 자산배분을 확인하고, 투자금 투입을 기반으로 목표비중에 따른 투자 실행을 지원한다.

## 주요 상태

Investment Funding:
- SCHEDULED
- AVAILABLE
- ON_HOLD
- IN_PROGRESS
- COMPLETED
- SKIPPED
- INACTIVE

Investment Suggestion:
- PENDING
- BUY_COMPLETED
- SELL_COMPLETED
- SKIPPED

UI:
- loading
- empty
- error
- stale-price

## Responsive

- Desktop: KPI + 실행 알림 + 차트 + 보유종목 테이블 + 투자금 이력
- Mobile: 투자 알림과 투자 실행 액션 우선, 보유종목 및 종목 상세는 세로 탐색

## Interaction

- 투자 예정일 도래 → 진행 / 보류 / 건너뛰기
- 진행 → 투자 시뮬레이션
- 추가 납입 → 별도 Investment Funding 생성
- 종목 상세 조회
- 평균매입가 / 보유수량 / 목표비중 보정
- 실제 주문 이후 완료 상태 반영

## Calculation Contract

- 목표비중은 계좌 기준 합계 100%를 기본으로 한다.
- 초기 리밸런싱은 신규 투자금으로 부족 비중을 채우는 매수 중심 방식이다.
- 제안 금액은 부족 비중에 비례 배분한다.
- 예상 수량은 현재가 기준 정수 주식 수를 사용한다.
- 잔여 투자금은 해당 Funding의 미사용 금액으로 보존한다.
- 투자 제안은 생성 시점 가격/비중을 스냅샷으로 보존한다.
- 실제 보유수량과 평균매입가는 사용자가 최종 보정할 수 있다.
- 금액/수량/수익률 계산은 정밀 숫자 타입을 사용하고 표시 금액을 임의 반올림하지 않는다.

## Data / API Dependency

초기 구현에서 본 화면은 실제 데이터 연결 대상이다.

- investment accounts
- holdings
- portfolio summary
- investment funding/plan
- investment execution/suggestion
- market price + fetchedAt
- performance history

## Acceptance Criteria

- `reference.png`의 정보 구조와 시각 hierarchy를 우선한다.
- 투자금 투입 모델을 `월 예약 투자금`에 종속시키지 않는다.
- 정기 투자, 추가 납입, 향후 일시 투자를 동일 Funding 모델로 확장 가능하게 구현한다.
- Donut/Line Chart와 투자 실행 카드가 실제 UI로 존재해야 한다.
- 가격 데이터 조회일시를 확인할 수 있어야 한다.
- PC/Mobile 주요 흐름을 Design Conformance 검증한다.

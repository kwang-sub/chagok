---
screen: SCR-021
spec_version: 2
behavior_status: DRAFT
status: DRAFT
source: IMAGE
reference: ./reference-web.jpg
reference_mobile: ./reference-mobile.jpg
fidelity: VISUAL
viewport: UNKNOWN
view_strategy: HYBRID
---

# SCR-021 투자 분석

Status: DRAFT

Reference:
- Desktop: `./reference-web.jpg`
- Mobile: `./reference-mobile.jpg`

Related:
- `docs/ui/screens/investment-portfolio/screen-spec.md`
- `docs/ui/screens/investment-history/screen-spec.md`
- 시장가격 이력 및 투자 성과 분석 후속 작업 문서

## Design Reference

본 화면은 투자 포트폴리오의 장기 성과, 위험, 자산별 기여도, 자산 간 상관관계, 리밸런싱 효과를 확인하기 위한 **투자 분석 전용 화면**이다.

정보 구조는 다음 원칙을 따른다.

- **상단: 숫자 중심의 핵심 지표**
- **하단: 차트/그래프 중심의 시각 분석**
- 전문 투자용 약어를 화면의 기본 레이블로 사용하지 않고, 일반 사용자가 이해하기 쉬운 한글 명칭을 우선한다.
- CAGR, MDD, Sharpe Ratio 등의 전문 용어와 계산 방식은 Info Popover로 제공한다.
- Desktop과 Mobile은 동일한 분석 정보를 제공하되, 화면 구성은 각 Viewport에 최적화한다.

핵심 시각 요소:
- 기간 필터: 1개월 / 1년 / 3년 / 5년 / 전체
- 총 수익률
- 연평균 수익률
- 최대 낙폭
- 투자원금 / 평가금액 / 평가손익 / 내 실제 수익률
- 위험과 효율
  - 변동성
  - 위험 대비 수익
- 리밸런싱 효과
- 자산 가치 추이
- 연도별 수익률
- 성과 기여도
- 자산 상관관계

## Viewport

### Desktop

Reference: `./reference-web.jpg`

상단은 KPI와 수치형 분석 정보를 넓은 카드 레이아웃으로 배치한다.

권장 순서:

1. 기간 필터
2. 총 수익률 / 연평균 수익률 / 최대 낙폭
3. 투자원금 / 평가금액 / 평가손익 / 내 실제 수익률
4. 위험과 효율 / 리밸런싱 효과
5. 자산 가치 추이
6. 연도별 수익률 / 성과 기여도 / 자산 상관관계

하단의 분석 카드들은 가용 너비에 따라 2~3열 Grid를 사용한다.

### Mobile

Reference: `./reference-mobile.jpg`

동일한 정보 우선순위를 유지하되 세로 Scroll 구조로 배치한다.

권장 순서:

1. 기간 필터
2. 총 수익률 / 연평균 수익률 / 최대 낙폭
3. 투자원금 / 평가금액 / 평가손익
4. 위험과 효율
5. 리밸런싱 효과
6. 자산 가치 추이
7. 연도별 수익률
8. 성과 기여도
9. 자산 상관관계

Mobile에서는 상관관계 전체 Matrix를 기본 노출하지 않고, 분산효과가 높은 대표 조합을 우선 제공한다.

## 화면 목적

사용자가 단순 평가손익뿐 아니라 다음 질문에 답할 수 있도록 한다.

- 장기간 투자 성과가 어느 정도였는가?
- 연평균으로 어느 정도 성장했는가?
- 투자 기간 중 가장 큰 하락은 어느 정도였는가?
- 수익률 변동에 비해 충분한 성과를 냈는가?
- 어떤 자산이 실제 포트폴리오 성과에 기여했는가?
- 보유 자산들이 서로 충분히 분산되어 있는가?
- 실제 리밸런싱이 성과에 어떤 영향을 주었는가?

## 주요 상태

UI:
- loading
- empty
- error
- insufficient-history
- stale-price
- partial-analysis

분석 가능 기간이 충분하지 않은 경우 계산 불가 값을 `0`으로 표시하지 않고 별도 상태로 처리한다.

예:
- 가격 이력 부족
- 비교 가능한 거래일 부족
- 리밸런싱 실행 이력 없음
- 무위험 수익률 기준값 미설정

## 기간 필터

지원 범위:
- 1개월
- 1년
- 3년
- 5년
- 전체

기간 변경 시 다음 항목은 동일 기준일 범위로 다시 계산한다.

- 총 수익률
- 연평균 수익률
- 최대 낙폭
- 변동성
- 위험 대비 수익
- 자산 가치 추이
- 연도별 수익률
- 성과 기여도
- 자산 상관관계
- 리밸런싱 효과

각 지표가 서로 다른 기간을 암묵적으로 사용하지 않도록 한다.

## 상단 핵심 성과 지표

### 총 수익률

화면 표시:
- `총 수익률`

목적:
- 선택 기간 동안 포트폴리오 투자전략 자체의 누적 성과를 보여준다.

계산 기준:
- 외부 입출금 영향을 제거한 Time-Weighted Return(TWR)을 기본 분석 수익률로 사용한다.
- 사용자의 실제 현금흐름 성과와 구분한다.

### 연평균 수익률

화면 표시:
- `연평균 수익률 ⓘ`

Popover:
- `CAGR (Compound Annual Growth Rate)`
- 투자 기간의 누적 성과를 연평균 복리 성장률로 환산한 값임을 설명한다.
- 계산식과 기준 기간을 함께 제공한다.

주의:
- 외부 입출금이 포함된 평가금액의 시작/종료 값만으로 직접 계산하지 않는다.
- 포트폴리오 성과 시계열을 기준으로 연환산한다.

### 최대 낙폭

화면 표시:
- `최대 낙폭 ⓘ`

Popover:
- `MDD (Maximum Drawdown)`
- 특정 기간 중 고점에서 이후 저점까지 가장 크게 하락한 비율임을 설명한다.
- 자산 가치 추이 Chart에서 실제 MDD 발생 구간을 함께 표시한다.

## 투자금 및 실제 성과

상단 Summary에서 다음 값을 제공한다.

- 투자원금
- 평가금액
- 평가손익
- 내 실제 수익률

### 내 실제 수익률

사용자의 실제 자금 투입 시점과 규모를 반영하는 Money-Weighted Return 기준 지표다.

계산 후보:
- XIRR / MWR

포트폴리오 자체의 전략 성과(TWR)와 사용자가 실제 경험한 투자 성과(MWR)를 명확히 구분한다.

## 위험과 효율

숫자 중심 영역이므로 Chart보다 앞에 배치한다.

### 변동성

화면 표시:
- `변동성 ⓘ`

설명:
- 기간 수익률의 변동 정도
- 일별 또는 기준 주기의 수익률 표준편차를 연환산한 값

화면에서는 전문적인 계산식을 항상 노출하지 않고 Popover에서 상세 설명한다.

### 위험 대비 수익

화면 표시:
- `위험 대비 수익 ⓘ`

보조 레이블:
- `샤프 지수`

Popover:
- `Sharpe Ratio`
- 무위험 수익률 대비 초과수익을 변동성으로 나눈 위험조정 성과 지표임을 설명한다.

계산을 위해 무위험 수익률 기준과 적용 기간을 명시적으로 관리해야 한다.

## 리밸런싱 효과

숫자 중심 영역이므로 Chart보다 앞에 배치한다.

화면 표시 예:

- 실제 포트폴리오: `+12.4%`
- 리밸런싱 미실행: `+11.7%`
- 효과: `+0.7%p`

기준 설명:
- `동일 현금흐름 기준 비교`

계산 원칙:

1. 실제 포트폴리오와 비교 포트폴리오에 동일한 외부 입출금 현금흐름을 적용한다.
2. 비교 포트폴리오는 해당 리밸런싱 거래만 실행하지 않은 Counterfactual Portfolio로 계산한다.
3. 가격 기준과 평가 기준일은 실제 포트폴리오와 동일하게 유지한다.
4. 효과 값은 두 포트폴리오의 동일 기간 수익률 차이(%p)로 표시한다.

리밸런싱 실행 식별은 기존 Investment Execution 계열 데이터에 다음 정보를 추가해 관리한다.

- `rebalance_type`
- `rebalance_group_id`

`rebalance_group_id`는 한 번의 리밸런싱에서 발생한 여러 자산의 매수/매도 실행을 하나의 이벤트로 그룹화한다.

별도 Rebalancing Event 테이블은 초기 구현의 필수 조건으로 두지 않는다.

## 자산 가치 추이

상단 숫자형 지표 이후 첫 번째 주요 Chart로 배치한다.

표시 정보:
- 기간별 포트폴리오 평가가치
- 최고점
- MDD 발생 저점
- 선택 기간

Desktop:
- 가로 폭을 최대한 활용하는 Wide Line Chart

Mobile:
- 단일 카드 내부 Line Chart
- 세부 값은 Tap/Tooltip로 제공

## 연도별 수익률

연도 단위 투자 성과를 비교한다.

표시:
- 연도
- 연간 수익률
- Positive / Negative 상태

최근 연도는 조회 기준일까지의 YTD 값으로 표시할 수 있으며, 완결 연도와 구분 가능해야 한다.

## 성과 기여도

단순 자산별 수익률이 아니라 **해당 자산이 전체 포트폴리오 성과에 얼마나 기여했는지**를 표시한다.

화면 표시 단위:
- `%p`

예:
- 미국주식 ETF: +8.3%p
- 국내주식 ETF: +2.1%p
- 금: +1.8%p
- 채권: +0.7%p

자산 자체 수익률과 포트폴리오 기여도를 동일 개념으로 표시하지 않는다.

## 자산 상관관계

가격 수준이 아니라 동일 기간의 **자산별 수익률 시계열**을 기준으로 계산한다.

기본 계산:
- Pearson Correlation

데이터 기준:
- 동일 거래일 정렬
- 조정가격 또는 Total Return에 적합한 가격 기준 사용
- 데이터 누락일 처리 정책을 명확하게 정의

### Desktop

4개 내외 주요 자산군에 대한 Correlation Matrix 또는 Heatmap을 제공할 수 있다.

예:
- 미국주식
- 국내주식
- 금
- 채권

### Mobile

전체 Matrix보다 대표적인 낮은 상관관계 조합을 우선 표시한다.

예:
- 미국주식 ↔ 채권
- 미국주식 ↔ 금
- 국내주식 ↔ 채권

보조 문구:
- `분산효과가 높은 조합`

상관계수만으로 특정 자산의 매수/매도를 추천하는 표현은 사용하지 않는다.

## Info Popover

전문 금융 지표는 화면에서 한글 명칭을 우선한다.

예:
- 연평균 수익률 → CAGR
- 최대 낙폭 → MDD
- 위험 대비 수익 → Sharpe Ratio

Desktop:
- Info icon Click 또는 접근 가능한 Hover/Focus

Mobile:
- Info icon Tap

Popover에 포함할 내용:
1. 전문 용어/약어
2. 쉬운 설명
3. 계산 기준
4. 필요할 경우 간단한 계산식

Popover는 본문 분석 정보를 과도하게 가리지 않도록 배치한다.

## Responsive

### Desktop

- 숫자형 KPI를 상단에 집중
- 위험/효율과 리밸런싱 효과를 Chart보다 위에 배치
- 자산 가치 추이를 Wide Chart로 제공
- 하단 분석 영역은 Grid 활용
- 상관관계는 Matrix/Heatmap 허용

### Mobile

- 숫자형 KPI를 Chart 이전에 모두 확인 가능하도록 구성
- 이후 Chart 및 비교 시각화를 세로 순서로 배치
- 상관관계는 대표 Pair 중심으로 단순화
- 긴 세로 Scroll을 허용하되 Card hierarchy를 유지

## Interaction

- 분석 기간 변경
- CAGR/MDD/Sharpe 등 Info Popover 열기/닫기
- 자산 가치 Chart point 조회
- MDD 구간 확인
- 자산 기여도 상세 확인
- 상관관계 조합 상세 확인
- 리밸런싱 효과 비교 기준 확인

초기 버전에서는 분석 화면에서 직접 리밸런싱 거래를 실행하지 않는다.
실행 기능은 투자 포트폴리오/투자 실행 Flow에 유지한다.

## Calculation Contract

### 성과 수익률

- 포트폴리오 분석 기본 수익률은 외부 Cash Flow 영향을 제거한 TWR을 사용한다.
- 사용자의 실제 투자 성과는 MWR/XIRR 계열 지표로 별도 표시한다.
- 수익률 계산에서 입금 자체를 투자수익으로 취급하지 않는다.

### Market Price

- 상관관계, 변동성, MDD 등 시계열 지표는 시장가격 이력을 사용한다.
- 가능하면 분할/분배 등 가격 이벤트를 반영할 수 있는 조정가격 기준을 사용한다.
- 가격 기준 및 데이터 출처는 Backend 계산 Contract에서 고정한다.

### MDD

- 선택 기간의 누적 성과 또는 Portfolio Index를 기준으로 Peak-to-Trough를 계산한다.
- 단순 평가금액은 외부 자금 유입으로 왜곡될 수 있으므로 그대로 사용하지 않는다.

### Volatility

- 동일 주기의 Portfolio Return Series를 기준으로 계산한다.
- 연환산 Factor를 명시적으로 관리한다.

### Sharpe Ratio

- Portfolio Return Series와 동일 기간 무위험 수익률을 사용한다.
- 무위험 수익률의 출처와 적용 방식을 고정해야 한다.

### Correlation

- 자산별 Return Series를 동일 날짜 기준으로 정렬한다.
- 가격 자체가 아니라 수익률을 대상으로 한다.

### Rebalancing Effect

- 실제 포트폴리오와 리밸런싱 미실행 가상 포트폴리오를 비교한다.
- 외부 입출금은 두 Portfolio에 동일하게 적용한다.
- 차이는 리밸런싱 거래 유무로 제한한다.

## Data / API Dependency

본 화면은 시장가격 이력 및 포트폴리오 시계열 데이터 확보 후 실제 데이터 연결 대상으로 구현한다.

필요 데이터:

- investment accounts
- portfolio
- holdings
- investment funding
- investment plan
- investment suggestion
- investment execution
- market price history
- portfolio daily snapshot
- portfolio asset daily snapshot
- target allocation history
- risk-free rate 기준 데이터

### market_price_history

주요 용도:
- 자산별 Return Series
- 자산 상관관계
- 변동성
- 가상 포트폴리오 평가

### portfolio_daily_snapshot

주요 용도:
- 포트폴리오 가치 추이
- 성과 지표 계산 최적화
- MDD / Return Series 계산

### portfolio_asset_daily_snapshot

권장 필드:
- portfolio_id
- asset_id
- snapshot_date
- quantity
- price
- market_value
- weight
- cost_basis

주요 용도:
- 자산별 기여도
- 과거 자산 비중
- 리밸런싱 전후 상태 분석
- 분석 재계산 비용 절감

### Rebalancing Identification

기존 실행 데이터에 다음 값을 추가한다.

- rebalance_type
- rebalance_group_id

예시 `rebalance_type`:
- NONE
- PERIODIC
- THRESHOLD
- MANUAL

목표 비중은 현재 값으로 덮어쓰지 않고 이력을 보존해야 한다.

## API Response 방향

한 API에서 화면 전체의 모든 원시 데이터를 무조건 전달하지 않는다.

권장 분리:

- Summary metrics
- Portfolio value series
- Annual returns
- Risk metrics
- Contribution
- Correlation
- Rebalancing effect

기간 변경 시 필요한 분석만 요청하거나 Backend가 분석 단위별 Response를 조합할 수 있어야 한다.

Desktop/Mobile의 UI 구조 차이 때문에 API 응답 필드를 별도로 이중화하지 않는다.
동일한 분석 Domain Contract를 사용하고 Frontend View Strategy에서 표현 방식을 달리한다.

## 초기 구현 범위

1차 구현 목표:

- 총 수익률
- 연평균 수익률
- 최대 낙폭
- 투자원금 / 평가금액 / 평가손익
- 내 실제 수익률
- 변동성
- 위험 대비 수익(Sharpe Ratio)
- 자산 가치 추이
- 연도별 수익률
- 성과 기여도
- 자산 상관관계
- 리밸런싱 효과

초기 구현에서 분석 지표의 계산 근거가 없는 경우 Mock 숫자를 Production UI에 남기지 않는다.

## 후속 확장

초기 분석 화면의 정보구조를 유지한 상태에서 다음 기능을 확장할 수 있다.

- Benchmark 대비 성과
- 목표 비중 대비 Drift
- 리밸런싱 이력별 효과
- Rolling Return
- Rolling Volatility
- Sortino Ratio
- 자산군/계좌별 성과 Drill-down
- Total Return 기반 분배금 포함 분석

후속 지표가 추가되더라도 상단 KPI를 무한 확장하지 않는다.
상세 전문 지표는 별도 상세 영역 또는 Drill-down 화면으로 분리한다.

## Accessibility

- 수익/손실을 색상만으로 구분하지 않는다.
- Chart의 핵심 값은 텍스트로도 확인 가능해야 한다.
- Info icon은 Keyboard Focus 및 Screen Reader Label을 지원한다.
- Correlation Heatmap은 숫자값을 함께 제공한다.
- Desktop Hover만으로 핵심 설명에 접근하도록 만들지 않는다.

## Acceptance Criteria

- Desktop Reference와 Mobile Reference가 각각 존재한다.
- 숫자 중심 지표는 주요 Chart보다 위에서 확인 가능해야 한다.
- `위험과 효율`과 `리밸런싱 효과`가 자산 가치 Chart보다 위에 배치된다.
- 연평균 수익률, 최대 낙폭은 한글 명칭을 기본 표시한다.
- CAGR/MDD/Sharpe Ratio 전문 용어와 계산 기준은 Info Popover에서 확인 가능하다.
- TWR과 사용자의 실제 수익률(MWR/XIRR)을 동일 지표로 혼용하지 않는다.
- MDD 계산에서 외부 자금 유입으로 인한 평가금액 왜곡을 방지한다.
- 성과 기여도는 자산 자체 수익률이 아니라 포트폴리오 기여도(%p)로 표시한다.
- 상관관계는 가격이 아닌 Return Series를 기반으로 계산한다.
- Mobile 상관관계는 대표 Pair를 우선하고 Desktop은 Matrix 표현을 허용한다.
- 리밸런싱 효과는 동일 외부 현금흐름 조건에서 비교한다.
- 한 번의 리밸런싱에 포함된 여러 실행은 `rebalance_group_id`로 식별 가능해야 한다.
- 목표 비중의 과거 이력을 보존한다.
- 가격 및 분석 데이터가 부족한 경우 계산 불가 상태를 명시한다.
- Desktop/Mobile은 동일 API Domain Contract를 사용한다.
- Reference 이미지와 주요 화면 흐름을 Design Conformance 검증한다.

## v2 문서 범위와 근거

기존 DRAFT 설계·계산 설명·API 방향·이미지 경로는 보존한다. 아래 근거는 모두 이 파일의 기존 제목을 가리키며 실제 구현/금융식의 검증이나 동작 승인이 아니다. 따라서 기능 상태는 PROPOSED로 유지한다.
VISUAL은 기존 Design Reference/Acceptance Criteria의 시각 계층 목표를 정규화한 값이지 승인 또는 exact CSS 관찰값이 아니다. 실제 viewport 수치는 UNKNOWN이다.
기존 주요 상태·기간 필터는 F-01/F-02, 핵심 지표·실제 성과·위험은 F-03, Info Popover는 F-04, 추이·연도별 수익률은 F-05, 기여도·상관관계는 F-06, 리밸런싱 효과는 F-07과 연결한다. 기존 AC와 계산/API 설명을 이 연결표로 대체하거나 재설계하지 않는다.

## View Strategy

- Strategy: HYBRID (PROPOSED)
- 근거: 기존 Responsive는 동일 분석 정보의 Grid/세로 배치를 사용하되 상관관계만 Desktop Matrix와 Mobile 대표 Pair로 의미 있는 표시 차이가 있다.
- Platform Scope: BOTH
- Section Overrides: 상관관계=SPLIT_VIEW (PROPOSED; 화면 전체 전략은 HYBRID)
- 공유 구현: 기간·분석 데이터/API/model/state·조회 소유자는 공유, KPI/대부분 차트는 responsive presentation 제안. 화면별 API/중복 fetch를 만들지 않는다.
- 분리 구현: 상관관계 Matrix/Pair presentation만 분리 제안. 상세/Popover는 접근성 요구에 따라 기존 패턴 재사용 여부를 판단한다.
- 패키지/뷰 계획: 기존 convention에 매핑하며 새 component 경로는 확정하지 않는다. 기존 component/token 목록은 source 미조사로 UNKNOWN.
- API Impact: NONE (문서 작업). 기존 API Response 방향 및 Data / API Dependency는 별도 API/DB 계약의 참고이며 이번에 승인·변경하지 않는다.
- 반응형/breakpoint: 기존 Responsive가 방향 근거, 정확한 breakpoint·Tablet은 UNKNOWN.
- 검증 행렬: Desktop Grid/Matrix와 Mobile 세로/Pair 각각 populated/loading/empty/error/insufficient-history/partial-analysis/stale-price, 기간 변경·키보드/터치를 AC-01~AC-10으로 확인할 계획. 실제 실행 NOT_RUN.

## 화면 기능 목록

| 기능 ID | 기능명 | 사용자 목적 / 설명 | 연결 UI ID | 확정 상태 | 근거 |
| --- | --- | --- | --- | --- | --- |
| F-01 | 분석 조회와 기간 선택 | 선택한 기간으로 모든 분석의 기준 일치 | UI-01 | PROPOSED | 기존 기간 필터/API Response 방향 |
| F-02 | 분석 가능 여부 확인 | 부족/부분/오래된 데이터와 실패 구분 | UI-02 | PROPOSED | 기존 주요 상태/초기 구현 범위 |
| F-03 | 수치형 성과·위험 조회 | 전략 성과와 실제 성과 및 위험 확인 | UI-03 | PROPOSED | 기존 상단 핵심 성과 지표/투자금 및 실제 성과/위험과 효율 |
| F-04 | 지표 설명 열기·닫기 | 한글 지표의 전문 용어·계산 기준 이해 | UI-04 | PROPOSED | 기존 Info Popover/Accessibility |
| F-05 | 자산 가치·연도 성과 탐색 | 추이 point·MDD 구간 및 연도 수익 확인 | UI-05 | PROPOSED | 기존 자산 가치 추이/연도별 수익률/Interaction |
| F-06 | 기여도·상관관계 상세 확인 | 성과 기여와 자산 조합의 관계 이해 | UI-06 | PROPOSED | 기존 성과 기여도/자산 상관관계/Interaction |
| F-07 | 리밸런싱 효과 비교 | 실제와 미실행 시나리오의 비교 기준 확인 | UI-07 | PROPOSED | 기존 리밸런싱 효과/Interaction/Calculation Contract |

## UI 요소 및 기능 연결

| UI ID | 요소 / 종류 / 표시명 | 위치 / 영역 | 연결 기능 ID | 노출 조건 | 활성화 / 표시 규칙 | 플랫폼 차이 |
| --- | --- | --- | --- | --- | --- | --- |
| UI-01 | 1개월 / 1년 / 3년 / 5년 / 전체 기간 필터 | 상단 | F-01 | 분석 화면 | 기본 선택 UNKNOWN, 적용된 기간을 결과와 구분 없이 오인하게 하지 않음(PROPOSED) | 같은 기간 선택 제공 |
| UI-02 | loading/empty/error/insufficient-history/partial-analysis/stale-price 안내, 재시도(제안) | 전체 또는 분석 영역 | F-02 | 해당 데이터 상태 발생 시 | 계산 불가를 0으로 표시하지 않음; 문구·가격시점/분석시점 위치·재시도 범위 UNKNOWN | 양 플랫폼에서 상태 확인 |
| UI-03 | 총 수익률/연평균 수익률/최대 낙폭, 투자원금/평가금액/평가손익/내 실제 수익률, 변동성/위험 대비 수익 | 차트 이전 숫자 영역 | F-03 | 분석값 또는 계산 불가 상태 | 기존 계산 설명의 TWR/MWR 구별, 금액·비율·샤프 지수의 의미 유지; 정확한 자리수/반올림/통화 UNKNOWN | Mobile 내 실제 수익률의 위치 누락은 아래 결정 항목 |
| UI-04 | 지표명 ⓘ / 지표 설명 Popover | 해당 수치 옆 | F-04 | 전문 지표 설명 제공 시 | 한글 기본명·접근 가능한 이름과 키보드 focus, 약어/쉬운 설명/계산 기준 제공 | Desktop click 또는 접근 가능한 hover/focus, Mobile tap |
| UI-05 | 자산 가치 Line Chart·point Tooltip·MDD 구간, 연도별 수익률 | 수치 이후 차트 | F-05 | 데이터 있음; 부족 시 F-02 | 선택 기간·최고점·저점·연도·수익률 및 부호 표시; 축 단위/범례·point 선택 해제 UNKNOWN | Desktop wide, Mobile 카드/tap |
| UI-06 | 성과 기여도 상세, 상관 Matrix/Heatmap·대표 Pair 상세 | 하단 분석 | F-06 | 분석 가능 시, 불가 시 F-02 | 기여도 %p, 상관은 숫자 병기; 매수/매도 추천으로 표현하지 않음 | PC Matrix 허용, Mobile 낮은 상관 대표 조합 우선 |
| UI-07 | 실제 포트폴리오/리밸런싱 미실행/효과, 동일 현금흐름 기준 비교 | 차트 이전 | F-07 | 분석 가능 또는 불가 사유 표시 | 수익률과 효과 %p 구분; 직접 실행 버튼 없음 | 같은 비교 기준, 레이아웃만 차이 |

## 기능별 동작 명세

### F-01 — 분석 조회와 기간 선택

| 항목 | 동작 명세 |
| --- | --- |
| 관련 UI | UI-01 |
| 실행 시점 | PROPOSED: 진입 시 자동 조회, 지원 기간 선택 시 재조회. UNKNOWN: 최초 기본 기간과 기준일/시간대 |
| 사전 조건 / 입력 검증 | 지원 기간은 기존 기간 필터 목록. UNKNOWN: 계좌/가계 조회 권한과 초기 대상, 선택 기간보다 이력이 짧을 때 실제 적용 범위 표시 |
| 정상 결과 | 기존 기간 필터에 열거된 지표·차트를 동일 기준일 범위로 갱신. 실제 수익률/원금 요약의 기간 반영 범위는 UNKNOWN으로 별도 결정 |
| 상태 / 예외 처리 | PROPOSED: 연속 변경 시 마지막 선택만 반영하고 늦은 이전 응답을 최신으로 표시하지 않음. UNKNOWN: 요청 취소/합치기 방식, 로딩 중 기존 결과 유지/숨김. 유지한다면 이전 기간을 명시하는 방안 제안 |
| 화면 이동 / 저장 | 분석 조회는 거래/설정 저장 없음. UNKNOWN: URL/재진입 시 기간 유지 여부. 실패 재시도는 F-02와 연결 |
| 플랫폼 차이 | 동일 기간 의미 공유; 키보드/터치로 선택 가능하도록 제안 |

### F-02 — 분석 가능 여부 확인

| 항목 | 동작 명세 |
| --- | --- |
| 관련 UI | UI-02 |
| 실행 시점 | 최초/기간 변경 조회의 분석별 결과 또는 실패 수신 |
| 사전 조건 / 입력 검증 | 가격 이력·거래일·리밸런싱 이력·무위험 수익률 등 기존 주요 상태의 조건. UNKNOWN: 부족/오래됨 판정 임계값과 API 상태 매핑 |
| 정상 결과 | 계산 불가를 0으로 대체하지 않고 부족 사유 표시; 실제 근거 없는 Mock 값을 Production에 남기지 않음(기존 초기 구현 범위) |
| 상태 / 예외 처리 | PROPOSED: partial-analysis는 가능한 지표와 불가 사유를 개별 표시, stale-price는 사용 가격의 시점을 안내. UNKNOWN: stale 허용 범위, 부분 실패와 이전 기간 값 공존 방식, 전체/개별 재시도 선택 |
| 화면 이동 / 저장 | 조회 전용. PROPOSED: 재시도는 현재 적용 기간/대상 유지, 실패를 빈 데이터로 바꾸지 않고 진행 중 재클릭 억제. 재시도 버튼 위치/자동 재시도는 UNKNOWN |
| 플랫폼 차이 | 두 플랫폼에서 같은 상태 의미; 영역별 문구 배치는 미확정 |

### F-03 — 수치형 성과·위험 조회

| 항목 | 동작 명세 |
| --- | --- |
| 관련 UI | UI-03 |
| 실행 시점 | F-01 조회 결과 표시 |
| 사전 조건 / 입력 검증 | 기존 Calculation Contract의 근거 데이터 사용, 입력 폼 없음. 정확한 계산법/상수/표시 정밀도는 여기서 새로 결정하지 않음 |
| 정상 결과 | 총 수익률(TWR)과 내 실제 수익률(MWR 계열)을 구별하고 연평균 수익률/최대 낙폭·원금/평가/손익·변동성/위험 대비 수익을 차트 위에 제공 |
| 상태 / 예외 처리 | 데이터 부족은 F-02; 무위험 기준 미설정을 샤프 지수 0으로 바꾸지 않음. UNKNOWN: 각 지표의 기준기간/통화/반올림 표시 세부 |
| 화면 이동 / 저장 | 정보 확인만 수행, 설명은 F-04. 거래 실행·금융 계산식 수정 없음 |
| 플랫폼 차이 | Mobile에도 동일 정보 제공이 기존 원칙이나 권장 순서에서 내 실제 수익률 누락. PROPOSED: 투자원금/평가금액/손익과 같은 summary 영역에 추가; 정확한 위치 승인 필요 |

### F-04 — 지표 설명 열기·닫기

| 항목 | 동작 명세 |
| --- | --- |
| 관련 UI | UI-04 |
| 실행 시점 | Desktop info click 또는 접근 가능한 hover/focus, Mobile tap. PROPOSED: 버튼에서 Enter/Space로 열기 |
| 사전 조건 / 입력 검증 | 설명할 지표가 있음; 사용자 수치 입력 없음. 기본 닫힘은 PROPOSED |
| 정상 결과 | 전문 용어/약어, 쉬운 설명, 계산 기준과 필요 시 기존 계산식 제공; 본문을 과도하게 가리지 않음 |
| 상태 / 예외 처리 | UNKNOWN: 동시 여러 설명 허용·설명 미제공 시 처리. 새 금융식을 추정해 채우지 않음 |
| 화면 이동 / 저장 | PROPOSED: 닫기 버튼/Escape/같은 trigger 재선택으로 닫고 키보드로 닫은 뒤 trigger로 포커스 복귀. 바깥 클릭·hover 이탈·Mobile back 닫기 정책과 dialog 여부는 UNKNOWN; 페이지 이동/저장 없음 |
| 플랫폼 차이 | Desktop hover만으로 접근을 제한하지 않음, Mobile tap 대체; focus 유지/이동 방식은 Popover 역할 확정 후 결정 |

### F-05 — 자산 가치·연도 성과 탐색

| 항목 | 동작 명세 |
| --- | --- |
| 관련 UI | UI-05 |
| 실행 시점 | 조회 결과 표시, chart point 조회 및 MDD 구간 확인 |
| 사전 조건 / 입력 검증 | 동일 선택 기간 시계열 필요; MDD 계산은 기존 Calculation Contract 참조, 평가금액 자체로 새 계산하지 않음 |
| 정상 결과 | 기간별 가치·최고점·MDD 저점/구간, 연도 수익률의 부호와 완결 연도/YTD 구분. 차트 핵심값 텍스트 제공 |
| 상태 / 예외 처리 | 데이터 부족은 F-02. UNKNOWN: 불완전 연도 표현 선택, point 없는 날짜 처리, Tooltip dismiss/선택 유지 |
| 화면 이동 / 저장 | 상세값 확인만 수행, 저장 없음. PROPOSED: point 날짜·값·단위를 텍스트로 확인; 별도 상세 화면 이동은 UNKNOWN |
| 플랫폼 차이 | Desktop wide chart, Mobile 단일 카드 tap/tooltip. PROPOSED: 키보드 또는 동등한 텍스트 목록으로 point 값 제공; 정확한 조작 방식은 UNKNOWN |

### F-06 — 기여도·상관관계 상세 확인

| 항목 | 동작 명세 |
| --- | --- |
| 관련 UI | UI-06 |
| 실행 시점 | 결과 표시 및 자산/조합 상세 선택 |
| 사전 조건 / 입력 검증 | 기존 성과 기여도/자산 상관관계의 데이터 조건. UNKNOWN: 대표 Pair 선정·동률 규칙, 상세에 필요한 추가 데이터 |
| 정상 결과 | 기여도는 %p로 자산 자체 수익률과 구분, 상관계수는 숫자로도 확인하고 매수/매도 추천 문구를 사용하지 않음 |
| 상태 / 예외 처리 | 부족/부분 실패는 F-02. UNKNOWN: 자산 하나뿐일 때 대표 조합 empty 표현, 상세 조회 실패/재시도 방식 |
| 화면 이동 / 저장 | 상세 확인 제공은 기존 Interaction 방향. UNKNOWN: 팝오버/드릴다운/화면 이동 중 표현, 상세 필드·닫기·복귀 상태. 새로운 상세 결과를 확정하지 않음; 거래 저장 없음 |
| 플랫폼 차이 | Desktop Matrix/Heatmap, Mobile 대표 낮은 상관 조합 우선. 상세 접근은 키보드/터치 동등 제공 제안 |

### F-07 — 리밸런싱 효과 비교

| 항목 | 동작 명세 |
| --- | --- |
| 관련 UI | UI-07 |
| 실행 시점 | 분석 결과 표시 및 비교 기준 확인 |
| 사전 조건 / 입력 검증 | 기존 리밸런싱 효과/Calculation Contract의 동일 현금흐름·가격·평가기준일 조건. 입력 폼 없음 |
| 정상 결과 | 실제/미실행 수익률과 차이 %p 및 동일 현금흐름 기준 설명을 차트 이전에 제공 |
| 상태 / 예외 처리 | 실행 이력 없음 등은 F-02의 불가 상태. UNKNOWN: 일부 이벤트만 계산 가능한 경우 비교 허용 범위 |
| 화면 이동 / 저장 | 직접 리밸런싱 거래를 실행하지 않음. UNKNOWN: 비교 기준 설명이 정적 안내/Popover/상세 중 어느 형태인지; 거래는 기존 포트폴리오 실행 흐름 책임 |
| 플랫폼 차이 | 동일 비교 정보 제공, Mobile은 세로 카드 순서 유지 |

## 기능별 검증 조건

아래는 DRAFT 검증 계획이며 모두 NOT_RUN이다. PROPOSED 동작은 승인 후 검증하고 UNKNOWN은 제품 결정 전 PASS로 간주하지 않는다.

| 검증 ID | 기능 ID | 사전 조건 / 상태 | 사용자 조작 / 트리거 | 기대 결과 | 검증 방법 |
| --- | --- | --- | --- | --- | --- |
| AC-01 | F-01 | 기본 기간 결정 후 데이터 있음 | 최초 진입·기간 변경 | 선택 기간과 모든 분석 표시의 기준 일치 | 양 플랫폼 기간 대조 계획 |
| AC-02 | F-01, F-02 | 기간 연속 변경·응답 역순 | 1개월→1년 선택 | PROPOSED 최신 선택만 반영, 이전 결과는 새 기간으로 오표시하지 않음 | 응답 순서 제어 계획 |
| AC-03 | F-02 | loading/empty/error/이력 부족 | 진입·재시도 | 상태 구분, 불가 값을 0/Mock으로 대체하지 않음; 재시도 정책 결정 필요 | 상태별 데이터 확인 계획 |
| AC-04 | F-02 | partial-analysis/stale-price | 조회·일부 실패 후 재시도 | PROPOSED 가능한 결과와 부족 사유·가격시점 구분, 현재 기간 유지 | 부분 실패·오래된 가격 확인 계획 |
| AC-05 | F-03 | 전략/실제 성과가 다른 데이터 | 수치 영역 조회 | TWR와 MWR 분리, 핵심 수치가 차트 위에 있음; Mobile 실제 수익률 위치는 승인 후 확인 | Desktop/Mobile 정보 목록 대조 계획 |
| AC-06 | F-04 | 키보드 또는 터치 사용 | 설명 열기·닫기 | 용어·설명·기준 제공, PROPOSED Enter/Space·Escape/닫기 및 trigger 포커스 복귀 | 키보드/터치 수동 계획 |
| AC-07 | F-05 | 추이·MDD·완결/YTD 데이터 | point 조회·연도값 확인 | 날짜/값 텍스트, MDD 구간, 수익 부호와 YTD 구분; 상세 조작 결정 필요 | chart/텍스트 대조 계획 |
| AC-08 | F-06 | 기여도·상관 데이터 있음 | 자산/조합 상세 선택 | %p와 상관 숫자 구별, Desktop Matrix/Mobile Pair; 상세 결과·복귀는 결정 후 확인 | 플랫폼별 상세 시나리오 계획 |
| AC-09 | F-07 | 비교 데이터 있음/이력 없음 | 비교 기준 확인 | 동일 현금흐름 설명·효과 %p 또는 불가 사유, 거래 실행 없음 | 수치/문구 대조 계획 |
| AC-10 | F-03, F-05, F-06 | 부족 데이터·색상 인지 제약 | 수치/차트 탐색 | 계산 불가를 0으로 대체하지 않고 색 외 텍스트로 핵심 의미 확인 | 접근성·부족 상태 수동 계획 |

## 미확정 사항 및 문서 충돌

- F-01: 기본 기간·권한·기준일·시간대·재조회 중 기존 값·재진입 유지 및 연속 요청 정책이 없다. 실제 수익률/원금 summary가 선택 기간에 어떻게 대응하는지도 결정해야 한다.
- F-02: partial-analysis의 결과 병합·stale 임계값/사용 허용·가격/분석 기준시점·재시도 단위는 UNKNOWN이다. 포트폴리오의 마지막 정상 가격 정책을 분석에 자동 전용하지 않는다.
- F-03: 기존 Viewport/Mobile 권장 순서 3에는 내 실제 수익률이 빠졌지만 Design Reference/투자금 및 실제 성과/초기 구현 범위는 동일 정보 제공을 요구한다. 누락은 기록으로 보존하고 summary에 포함하는 방안을 PROPOSED로 둔다. 정확한 위치는 결정 필요.
- F-04: 기본 닫힘·Escape/닫기/재선택·포커스 복귀는 새 제안이다. 바깥 클릭/hover 이탈/동시 설명/모바일 back와 Popover 역할은 결정 필요.
- F-05/F-06/F-07: point Tooltip·상세의 구체 결과/route·닫기/복귀, 대표 Pair 선정, 비교 기준 설명 UI가 UNKNOWN이다. 표시 범위와 행동을 이미지에서 추정해 승인하지 않는다.
- 계산 설명 간 차이: 기존 최대 낙폭/자산 가치 추이는 가치 chart의 MDD 저점 표시를 설명하고 Calculation Contract/MDD는 현금흐름 영향을 제거한 성과/Index를 기준으로 한다. 기존 식을 바꾸지 않고 chart 표시값과 MDD 구간의 대응·설명을 별도 계약에서 확정해야 한다.
- 기존 API/DB 방향의 rebalance 식별·snapshot·목표비중 이력 요구는 보존된 DRAFT 참고이며 이번 schema 변경 또는 승인 근거가 아니다. 새 금융 계산식·API를 만들지 않는다.
- 기존 후속 확장의 Benchmark/Drift/Rolling 지표 등은 이번 기능 목록 범위 밖이다.
- 구조 검사만으로 동작 승인·실제 테스트·Design Conformance가 완료되지 않는다. 문서 작업이므로 Node/JVM/browser 검증은 NOT_REQUIRED/NOT_RUN이다.

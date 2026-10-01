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

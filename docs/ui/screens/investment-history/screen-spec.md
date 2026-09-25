# SCR-022 투자 내역

Status: APPROVED

Reference: `./reference.png`

Legacy detail: `docs/product/screens/SCR-022-investment-history.md`

## Design Reference

승인 기준 이미지는 **투자금 투입 이력 중심의 투자 내역 최종 시안**이다.

핵심 시각 요소:
- 전체 / 정기 투자 / 추가 납입 / 일시 투자 탭
- 총 투자금 / 완료 금액 / 진행 중 금액 / 보류 금액 / 건너뛰기 금액 요약
- 기간 / 유형 / 계좌 / 상태 / 키워드 필터
- 투자 내역 테이블
- 상세 Drawer
- 다시 투자하기 / 복사하여 새로 등록
- 매수/매도 제안과 실제 실행 결과 비교
- Mobile 투자 내역, 상세, 투자하기 진입, 매수/매도 제안

## Viewport

- Desktop: reference의 PC 리스트/Drawer 기준
- Mobile: reference의 각 Mobile 프레임 기준

## 화면 목적

정기 투자, 추가 납입, 일시 투자 등 투자금 투입의 전체 이력과 각 투자 실행 상태 및 결과를 조회한다.

## 주요 상태

- 진행
- 보류
- 건너뛰기
- 완료
- loading
- empty
- error

## Responsive

- Desktop: 요약 KPI + 필터 + 테이블 + 상세 Drawer
- Mobile: 요약 카드 + 간결한 리스트 + 별도 상세/실행 화면

## Interaction

- 기간/유형/계좌/상태/키워드 필터
- 투자 내역 상세 조회
- 동일 조건 다시 투자하기
- 기존 투자금을 복사하여 새 투자금 등록
- 매수/매도 제안과 실제 실행 결과 비교

## Data / API Dependency

초기 구현에서 본 화면은 실제 데이터 연결 대상이다.

- investment funding history
- investment execution status
- suggestion snapshots
- execution results
- account metadata

## Acceptance Criteria

- 종목별 체결 장부가 아니라 Investment Funding/Execution 이력을 중심으로 구성한다.
- 정기/추가/일시 투자 유형을 동일한 목록에서 구분 가능해야 한다.
- 제안 결과와 실제 실행 결과를 함께 확인할 수 있어야 한다.
- 완료/보류/건너뛰기 상태를 명확하게 구분한다.
- PC/Mobile과 상세 Drawer/실행 흐름을 Design Conformance 검증한다.

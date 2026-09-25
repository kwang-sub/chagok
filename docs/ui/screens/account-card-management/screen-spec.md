# SCR-050 계좌·카드 정보 관리

Status: APPROVED

Reference: `./reference.png`

Legacy detail: `docs/product/screens/SCR-050-account-card-management.md`

## Design Reference

승인 기준 이미지는 **계좌/카드 탭, Mobile, 등록/수정 Modal을 포함한 최종 계좌·카드 관리 시안**이다.

핵심 시각 요소:
- 계좌 / 카드 탭
- 계좌 수 / 총 잔액 / 유형 비중 요약
- 필터/검색
- 계좌/카드 목록 테이블
- PC 상세 Drawer
- 공통 등록/수정 Modal
- Mobile 계좌/카드 목록과 FAB

## Viewport

- Desktop: reference의 계좌/카드 PC 화면 기준
- Mobile: reference의 계좌/카드 Mobile 화면 기준

## 화면 목적

가계의 금융수단(은행계좌, 증권계좌, 연금계좌, 신용/체크카드 등)을 통합 관리하고 다른 화면에서 참조하는 기준정보를 제공한다.

## 주요 상태

- 사용중
- 비활성화
- 연계대기(향후 연동 기능 사용 시)
- loading
- empty
- error

## Responsive

- Desktop: 탭 + 요약 + 필터 + 테이블 + Drawer/Modal
- Mobile: 탭 + 카드형 목록 + 등록 FAB + 별도 입력 화면/Modal

## Interaction

- 계좌/카드 탭 전환
- 계좌/카드 등록/수정/비활성화
- 상세 조회
- 계좌유형/카드종류/금융기관/구성원/상태 필터
- 카드의 결제계좌 선택

## Permission

- 같은 가계 구성원의 정보는 조회 가능
- 등록/수정/비활성화는 해당 명의자만 가능
- 자산유형/계좌유형 등 관리성 기준정보는 권한이 있는 계정만 변경 가능

## Data / API Dependency

- account list/detail
- card list/detail
- financial institution metadata
- account/card type metadata
- owner/member metadata
- card payment account mapping

초기 화면에서는 샘플 데이터를 사용할 수 있으나 투자계좌는 SCR-020 실제 투자 데이터와 동일한 계좌 식별자를 사용해야 한다.

## Acceptance Criteria

- 계좌와 카드를 한 화면에서 탭으로 관리한다.
- 등록/수정은 Desktop Modal, Mobile은 별도 화면 또는 모바일 입력 패턴을 따른다.
- 삭제 대신 비활성화 정책을 사용한다.
- 계좌/카드 정보는 다른 도메인의 기준정보로 재사용 가능해야 한다.
- PC/Mobile 및 등록/수정 상태를 검증한다.

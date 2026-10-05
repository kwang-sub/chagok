# 계좌·카드 관리 화면별 디자인 자료

Status: DRAFT

마지막 수정: 2026-10-05, KST

계좌 목록·상세·등록/수정과 카드 목록·상세·등록/수정을 각각 관리한다. 각 폴더의 `screen-spec.md`가 화면 설명 초안이며, 이미지는 아래 위치에 업로드한다.

**현재 상태: 6개 화면 폴더와 설명 초안 준비. 새 이미지 파일은 아직 업로드하지 않았다.** 기존 루트 `reference.png`는 이전 통합 시안으로 보존한다.

공통 정책과 확정/미정 구분은 [화면군 설명](./screen-spec.md)을 먼저 확인한다.

## 화면별 업로드 위치

기준 경로: `docs/ui/screens/account-card-management/`

| 화면 | 설명 초안 | 이미지 업로드 경로 | 상태 |
| --- | --- | --- | --- |
| 1. 계좌 목록 | [account-list](./account-list/screen-spec.md) | `account-list/reference.png` | 업로드 대기 |
| 2. 계좌 상세 | [account-detail](./account-detail/screen-spec.md) | `account-detail/reference.png` | 업로드 대기 |
| 3. 계좌 등록·수정 | [account-form](./account-form/screen-spec.md) | `account-form/reference.png` | 업로드 대기 |
| 4. 카드 목록 | [card-list](./card-list/screen-spec.md) | `card-list/reference.png` | 업로드 대기 |
| 5. 카드 상세 | [card-detail](./card-detail/screen-spec.md) | `card-detail/reference.png` | 업로드 대기 |
| 6. 카드 등록·수정 | [card-form](./card-form/screen-spec.md) | `card-form/reference.png` | 업로드 대기 |

각 폴더는 `screen-spec.md`로 생성되어 있다. 이미지가 없는 상태를 숨기기 위해 빈 PNG나 가짜 이미지 파일을 만들지 않는다. 위 이미지 경로는 예정 경로이므로 아직 실제 이미지 링크로 삽입하지 않는다.

## 대화에서 분리한 이미지 파일 대응

다운로드한 이름이 다르면 파일명보다 이미지 안의 화면 제목을 기준으로 구분한다.

| 분리 이미지 | 업로드 대상 |
| --- | --- |
| `계좌_관리_대시보드_ui_쇼케이스.png` | `account-list/reference.png` |
| `차곡_계좌_상세_ui_가이드.png` | `account-detail/reference.png` |
| `차곡_계좌_등록_ui_목업.png` | `account-form/reference.png` |
| `차곡_카드_목록_ui_디자인.png` | `card-list/reference.png` |
| `신한카드_상세_화면_ui_비교.png` | `card-detail/reference.png` |
| `차곡_카드_등록_화면_ui_목업.png` | `card-form/reference.png` |

현재 분리 이미지는 **한 화면의 Desktop과 Mobile을 함께 담은 보드**이므로 각 폴더의 `reference.png`로 올린다. 루트의 이전 통합 `reference.png`를 덮어쓰는 방식이 아니다.

## 업로드 방법

1. `dev` 브랜치에서 위 표의 해당 화면 폴더를 연다.
2. 해당 이미지를 `reference.png`로 이름을 바꿔 `Add file → Upload files`로 추가한다. 설명 문서는 그대로 둔다.
3. 커밋 후 실제 경로와 이미지 표시를 확인한다. 이 문서의 상태를 업로드 완료로 바꾸고 해당 `screen-spec.md`의 Reference를 실제 파일 링크로 전환한다.
4. 아래 정합성 항목을 확인한 뒤 디자인 승인 상태를 별도로 갱신한다. 단순 업로드를 기능 구현·데이터 계약 승인으로 취급하지 않는다.

## Desktop / Mobile을 따로 저장할 때

현재의 결합 보드는 `reference.png`로 보존한다. 뷰포트별로 분리한 추가 파일은 저장소의 기존 확장 규칙을 따른다.

```text
account-detail/
  screen-spec.md
  reference.png             # 현재 Desktop + Mobile 결합 보드
  reference-desktop.png     # 뷰포트별 분리 이미지가 준비된 경우 추가
  reference-mobile.png      # 뷰포트별 분리 이미지가 준비된 경우 추가
```

나머지 화면 폴더에도 같은 이름을 사용한다. 분리본이 없다면 같은 결합 보드를 파일명만 바꿔 Desktop/Mobile 이미지라고 올리지 않는다. Desktop끼리, Mobile끼리 각각 동일한 캔버스 규격·배율을 사용하고 실제 크기는 업로드 시 확인해 기록한다. 현재 초안은 확인되지 않은 해상도를 규격으로 확정하지 않는다.

## 업로드 후 시안 정합성 확인

- 명의 입력·선택, 카드 결제계좌, 활용현황, 상세 하단 사용상태 영역이 없어야 한다.
- 웹 상세는 요약과 본문이 하나의 상세 카드이며 상단 수정·설정/더보기 버튼 없이 하단 액션만 사용한다.
- 카드 목록의 등록 버튼은 “카드 등록”이어야 한다. 분리 시안의 “계좌 등록”은 수정할 오기다.
- 카드 상세 분리 시안의 유효기간·발급일·연회비·혜택, 계좌 상세의 별도 통장 용도, 전체 번호 표시 등은 확정 요구사항으로 자동 채택하지 않는다.
- 총 잔액·현재 잔액·월 사용액·유형 비중, 잔액 직접 입력, 상태 직접 전환, 필수 별표·최대 길이·하이픈 규칙은 각 설명의 미정 사항과 대조한다. 시각 샘플만으로 데이터·검증 정책을 확정하지 않는다.
- 모든 이름·번호·금액은 샘플을 사용한다. 실제 번호·개인정보를 이미지에 넣지 않는다.

정합성 수정이 필요한 이미지도 원본 시안으로 보관할 수 있지만, 수정 완료 전 최종 구현 기준 이미지로 표시하지 않는다. 수정 필요 항목과 승인 여부는 각 화면 설명에 남긴다.

## 이번 변경 범위

화면별 폴더, 설명 초안, 이미지 업로드 안내를 추가한다. 새 이미지 업로드, application 구현, API·DB 변경, 금융기관 API 실호출, 디자인 승인 승격, 브라우저/시각 회귀 테스트는 수행하지 않는다.

# 차곡 UI Design Package

차곡의 프론트엔드 구현은 화면별 **Design Reference + Screen Specification**을 기준으로 진행한다.

## Source of Truth

- `reference.png`: 승인된 화면의 시각 계약. 어떻게 보여야 하는지 정의한다.
- `screen-spec.md`: 화면의 동작 계약. 상태, 반응형, 상호작용, 권한, API 의존성을 정의한다.
- Storybook: 실제 구현된 UI의 관찰 기준이다.
- Playwright Golden: 구현 승인 이후 Visual Regression 기준이다.

## 구현 원칙

1. Repository-local reference가 있으면 Figma 등 외부 디자인 Provider를 필수로 호출하지 않는다.
2. 최초 구현 시 `reference.png`와 실제 렌더링은 `VISUAL_CONFORMANCE`로 검증한다.
3. 최초 구현 승인 후 브라우저 스크린샷을 Golden으로 승격한다.
4. 이후 변경에서는 Golden 기준 `VISUAL_REGRESSION`을 수행한다.
5. Design Conformance 단계에서는 폰트 래스터라이징, 안티앨리어싱 등 환경 차이를 고려해 자동 diff와 Human Review를 함께 사용한다.
6. 금액 표시는 반올림하지 않으며 실제 구현에서는 정밀 숫자 타입을 사용한다.

## 등록 화면과 승인 이력

현재 승인 상태는 각 패키지의 `screen-spec.md`를 확인한다. 과거 승인 이력이 새 하위 화면 초안의 승인을 의미하지 않는다.

| Screen | Package | Legacy 상세 명세 |
|---|---|---|
| SCR-001 홈 대시보드 | `screens/dashboard/` | `docs/product/screens/SCR-001-home-dashboard.md` |
| SCR-010 자산 현황 | `screens/asset-overview/` | `docs/product/screens/SCR-010-asset-overview.md` |
| SCR-011 부채 관리 | `screens/debt-management/` | `docs/product/screens/SCR-011-debt-management.md` |
| SCR-020 투자 포트폴리오 | `screens/investment-portfolio/` | `docs/product/screens/SCR-020-investment-portfolio.md` |
| SCR-022 투자 내역 | `screens/investment-history/` | `docs/product/screens/SCR-022-investment-history.md` |
| SCR-050 계좌·카드 정보 관리 — 6개 화면 분리 초안 | [screens/account-card-management/](./screens/account-card-management/README.md) | `docs/product/screens/SCR-050-account-card-management.md` |

## Reference 파일 규칙

현재 승인된 화면 보드는 Desktop/Mobile 및 필요한 Drawer/Modal을 하나의 이미지에 함께 포함하므로 각 패키지는 우선 `reference.png` 하나를 기준본으로 사용한다.

향후 구현/검증 편의를 위해 화면이 분리될 필요가 생기면 다음과 같이 확장할 수 있다.

```text
reference.png
reference-desktop.png
reference-mobile.png
reference-empty.png
reference-error.png
```

`reference.png`가 존재할 경우 해당 파일을 최우선 Visual Source of Truth로 사용한다. 단, 패키지 설명에서 이전 시안으로 명시한 이미지는 현재 승인 이미지로 자동 적용하지 않는다.

### SCR-050 화면 분리 전환

2026-10-05부터 계좌·카드 화면군은 [6개 하위 화면 초안](./screens/account-card-management/screen-spec.md)으로 관리한다. 루트 `screens/account-card-management/reference.png`는 이전 통합 시안으로 보존하며, 명의 설정·결제계좌·상세 블록/버튼 등 새 사용자 합의와 충돌하는 과거 구성을 강제하지 않는다.

새 이미지는 각 하위 폴더의 `reference.png`로 업로드한 뒤 정합성 검토와 승인을 별도로 기록한다. 현재는 업로드 대기이며, 업로드 또는 문서 초안 추가만으로 디자인 승인·구현 완료·Golden 생성을 의미하지 않는다. 구체적인 경로와 미정 사항은 [화면별 업로드 안내](./screens/account-card-management/README.md)를 따른다.

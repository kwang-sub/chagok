# Chagok Backend PoC

Kotlin + Spring Boot 기반 차곡 초기 PoC입니다.

## PoC 목표

1. 금융위원회 공공데이터 API에서 최신 기준일의 국내 상장 ETF 조회
2. 선택한 ETF 코드를 Google Sheet에 종목별 행으로 기록
3. `GOOGLEFINANCE()` 수식으로 가격 계산
4. Google Sheets API로 계산 결과를 다시 읽어 Spring Boot에서 반환

## 기술 스택

- Java 21
- Kotlin 2.2
- Spring Boot 3.5
- Gradle Kotlin DSL
- Spring MVC `RestClient`
- Google Sheets REST API

## 필요한 환경변수

`.env.example`을 참고합니다.

```text
PUBLIC_DATA_SERVICE_KEY=<공공데이터포털 일반 인증키>
GOOGLE_SHEETS_SPREADSHEET_ID=<Google Sheet ID>
GOOGLE_SHEETS_SHEET_NAME=MarketData
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account.json
```

`PUBLIC_DATA_SERVICE_KEY`는 공공데이터포털에서 제공된 값을 그대로 사용할 수 있습니다. 이미 URL 인코딩된 키는 그대로 유지하고, 미인코딩 키만 애플리케이션에서 한 번 인코딩합니다.
Google 서비스 계정 이메일에는 대상 Sheet의 편집 권한을 부여해야 합니다.

## Google Sheet 준비

`MarketData` 시트 탭만 생성하면 됩니다. 헤더와 ETF 행은 애플리케이션이 자동으로 관리합니다.

```text
Ticker | Price | TradeTime | DataDelay | ChangePercent
```

동일 ETF를 다시 요청하면 기존 행을 재사용하고, 새로운 ETF는 다음 행에 추가합니다.

## API

### 최신 ETF 기준일 확인

```http
GET /api/poc/etfs/latest-base-date
```

### 최신 기준일 ETF 검색

```http
GET /api/poc/etfs?keyword=S&P500&page=1&size=20
```

`keyword`가 있으면 종목명 부분검색을 수행하고, 결과는 항상 공공데이터 API의 최신 `basDt`로 제한합니다.

### 특정 ETF Google Finance 연동 검증

```http
POST /api/poc/etfs/{ticker}/market-price
```

예:

```http
POST /api/poc/etfs/360750/market-price
```

처리 흐름:

```text
최신 기준일 공공데이터 ETF 확인
-> Google Sheet에서 KRX:{ticker} 행 조회 또는 새 행 추가
-> GOOGLEFINANCE 수식 입력
-> 계산 결과 재조회(최대 5회)
-> 공공데이터 기준일/종가 + Google Finance 값 반환
```

`tradetime`은 Google Sheets의 날짜 serial number가 아니라 포맷된 날짜/시간 문자열로 조회합니다.

## PoC 성공 기준

- 공공데이터 API에서 최신 기준일의 실제 국내 ETF 종목이 조회된다.
- 종목명 부분검색이 최신 기준일 데이터에서 동작한다.
- 여러 ETF를 Google Sheet의 서로 다른 행에 유지할 수 있다.
- 선택한 국내 ETF가 `GOOGLEFINANCE`에서 가격을 계산한다.
- Google Sheets API에서 계산된 가격을 읽어 Spring Boot 응답으로 반환한다.
- `tradetime`, `datadelay`, `changepct`의 국내 ETF 지원 여부를 실제 응답으로 확인한다.

## PoC 주의사항

- `GOOGLEFINANCE` 값은 실시간 체결가가 아니며 지연될 수 있습니다.
- 국내 ETF에 대한 Google Finance 지원 여부는 종목별 실제 검증이 필요합니다.
- 수식 입력 직후 계산이 완료되지 않을 수 있어 PoC에서는 500ms 간격으로 최대 5회 재조회합니다.
- 공공데이터 ETF API는 일자별 시세 이력을 포함하므로 ETF 마스터 조회 시 최신 `basDt`를 명시적으로 적용합니다.
- API 키와 서비스 계정 JSON은 저장소에 커밋하지 않습니다.

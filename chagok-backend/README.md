# Chagok Backend PoC

Kotlin + Spring Boot 기반 차곡 초기 PoC입니다.

## PoC 목표

1. 금융위원회 공공데이터 API에서 국내 상장 ETF 조회
2. 선택한 ETF 코드를 Google Sheet에 기록
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
PUBLIC_DATA_SERVICE_KEY=<공공데이터포털 일반 인증키 Decoding 값>
GOOGLE_SHEETS_SPREADSHEET_ID=<Google Sheet ID>
GOOGLE_SHEETS_SHEET_NAME=MarketData
GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account.json
```

`PUBLIC_DATA_SERVICE_KEY`는 Spring URI builder가 query parameter를 인코딩하므로 포털에서 제공하는 **Decoding 인증키**를 사용합니다.
Google 서비스 계정 이메일에는 대상 Sheet의 편집 권한을 부여해야 합니다.

## Google Sheet 준비

`MarketData` 시트를 만들고 1행을 다음과 같이 준비합니다.

```text
Ticker | Price | TradeTime | DataDelay | ChangePercent
```

PoC에서는 선택 ETF 한 종목을 2행에 기록합니다.

## API

### ETF 검색

```http
GET /api/poc/etfs?keyword=S&P500&page=1&size=20
```

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
공공데이터 ETF 확인
-> Google Sheet에 KRX:{ticker} 및 GOOGLEFINANCE 수식 입력
-> 계산 결과 조회
-> 공공데이터 기준일/종가 + Google Finance 값 반환
```

## PoC 성공 기준

- 공공데이터 API에서 실제 국내 ETF 종목이 조회된다.
- 선택한 국내 ETF가 `GOOGLEFINANCE`에서 가격을 계산한다.
- Google Sheets API에서 계산된 가격을 읽어 Spring Boot 응답으로 반환한다.
- `tradetime`, `datadelay`, `changepct`의 국내 ETF 지원 여부를 실제 응답으로 확인한다.

## PoC 주의사항

- `GOOGLEFINANCE` 값은 실시간 체결가가 아니며 지연될 수 있습니다.
- 국내 ETF에 대한 Google Finance 지원 여부는 종목별 실제 검증이 필요합니다.
- 수식 입력 직후 Google 계산이 완료되지 않았다면 읽기 시 빈 값/오류가 발생할 수 있습니다. 이 동작 역시 PoC 검증 대상입니다.
- API 키와 서비스 계정 JSON은 저장소에 커밋하지 않습니다.

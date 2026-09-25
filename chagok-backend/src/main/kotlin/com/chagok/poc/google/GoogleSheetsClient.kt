package com.chagok.poc.google

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.google.auth.oauth2.GoogleCredentials
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.io.FileInputStream
import java.math.BigDecimal

@Component
class GoogleSheetsClient(
    private val properties: GoogleSheetsProperties,
    private val objectMapper: ObjectMapper,
    restClientBuilder: RestClient.Builder,
) {
    private val restClient = restClientBuilder
        .baseUrl("https://sheets.googleapis.com/v4/spreadsheets")
        .build()

    private fun accessToken(): String {
        val credentials = FileInputStream(properties.credentialsPath).use {
            GoogleCredentials.fromStream(it)
                .createScoped(listOf("https://www.googleapis.com/auth/spreadsheets"))
        }
        credentials.refreshIfExpired()
        return credentials.accessToken.tokenValue
    }

    fun upsertMarketData(ticker: String): Int {
        ensureHeader()

        val googleTicker = "KRX:$ticker"
        val rowNumber = findRowNumber(googleTicker) ?: nextRowNumber()
        val range = "${properties.sheetName}!A$rowNumber:E$rowNumber"
        val body = mapOf(
            "range" to range,
            "majorDimension" to "ROWS",
            "values" to listOf(
                listOf(
                    googleTicker,
                    "=GOOGLEFINANCE(A$rowNumber,\"price\")",
                    "=GOOGLEFINANCE(A$rowNumber,\"tradetime\")",
                    "=GOOGLEFINANCE(A$rowNumber,\"datadelay\")",
                    "=GOOGLEFINANCE(A$rowNumber,\"changepct\")",
                ),
            ),
        )

        updateValues(range, body)
        return rowNumber
    }

    fun readMarketDataWithRetry(
        rowNumber: Int,
        maxAttempts: Int = 5,
        delayMillis: Long = 500,
    ): MarketDataRow {
        var lastResult: MarketDataRow? = null

        repeat(maxAttempts) { attempt ->
            lastResult = readMarketData(rowNumber)
            if (!lastResult?.googleTicker.isNullOrBlank() && lastResult?.price != null) {
                return requireNotNull(lastResult)
            }

            if (attempt < maxAttempts - 1) {
                Thread.sleep(delayMillis)
            }
        }

        error("GOOGLEFINANCE 가격 계산이 완료되지 않았습니다. row=$rowNumber, lastResult=$lastResult")
    }

    private fun readMarketData(rowNumber: Int): MarketDataRow {
        val range = "${properties.sheetName}!A$rowNumber:E$rowNumber"
        val response = restClient.get()
            .uri(
                "/{spreadsheetId}/values/{range}" +
                    "?valueRenderOption=UNFORMATTED_VALUE&dateTimeRenderOption=FORMATTED_STRING",
                properties.spreadsheetId,
                range,
            )
            .header("Authorization", "Bearer ${accessToken()}")
            .retrieve()
            .body(String::class.java)
            ?: error("Google Sheets response is empty")

        val root = objectMapper.readTree(response)
        val values = root.path("values")
        require(values.isArray && !values.isEmpty) { "Google Sheets returned no values" }
        val row = values[0]

        return MarketDataRow(
            googleTicker = row.getOrNull(0)?.asText(),
            price = row.decimalOrNull(1),
            tradeTime = row.getOrNull(2)?.asText(),
            dataDelay = row.intOrNull(3),
            changePercent = row.decimalOrNull(4),
        )
    }

    private fun ensureHeader() {
        val range = "${properties.sheetName}!A1:E1"
        val body = mapOf(
            "range" to range,
            "majorDimension" to "ROWS",
            "values" to listOf(
                listOf("Ticker", "Price", "TradeTime", "DataDelay", "ChangePercent"),
            ),
        )
        updateValues(range, body)
    }

    private fun findRowNumber(googleTicker: String): Int? {
        val values = readColumnValues()
        return values.indexOfFirst { it == googleTicker }
            .takeIf { it >= 0 }
            ?.plus(DATA_START_ROW)
    }

    private fun nextRowNumber(): Int = DATA_START_ROW + readColumnValues().size

    private fun readColumnValues(): List<String> {
        val range = "${properties.sheetName}!A$DATA_START_ROW:A"
        val response = restClient.get()
            .uri("/{spreadsheetId}/values/{range}?valueRenderOption=UNFORMATTED_VALUE", properties.spreadsheetId, range)
            .header("Authorization", "Bearer ${accessToken()}")
            .retrieve()
            .body(String::class.java)
            ?: error("Google Sheets response is empty")

        val values = objectMapper.readTree(response).path("values")
        if (!values.isArray) {
            return emptyList()
        }

        return values.mapNotNull { row -> row.getOrNull(0)?.asText() }
    }

    private fun updateValues(range: String, body: Map<String, Any>) {
        restClient.put()
            .uri("/{spreadsheetId}/values/{range}?valueInputOption=USER_ENTERED", properties.spreadsheetId, range)
            .header("Authorization", "Bearer ${accessToken()}")
            .body(body)
            .retrieve()
            .toBodilessEntity()
    }

    private fun JsonNode.getOrNull(index: Int): JsonNode? =
        if (isArray && size() > index && !get(index).isNull) get(index) else null

    private fun JsonNode.decimalOrNull(index: Int): BigDecimal? =
        getOrNull(index)?.takeIf { it.isNumber }?.decimalValue()

    private fun JsonNode.intOrNull(index: Int): Int? =
        getOrNull(index)?.takeIf { it.isNumber }?.asInt()

    companion object {
        private const val DATA_START_ROW = 2
    }
}

data class MarketDataRow(
    val googleTicker: String?,
    val price: BigDecimal?,
    val tradeTime: String?,
    val dataDelay: Int?,
    val changePercent: BigDecimal?,
)

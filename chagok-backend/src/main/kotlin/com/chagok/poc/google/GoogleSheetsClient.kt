package com.chagok.poc.google

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.google.auth.oauth2.GoogleCredentials
import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.io.FileInputStream

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

    fun upsertMarketData(ticker: String) {
        val googleTicker = "KRX:$ticker"
        val range = "${properties.sheetName}!A2:E2"
        val body = mapOf(
            "range" to range,
            "majorDimension" to "ROWS",
            "values" to listOf(
                listOf(
                    googleTicker,
                    "=GOOGLEFINANCE(A2,\"price\")",
                    "=GOOGLEFINANCE(A2,\"tradetime\")",
                    "=GOOGLEFINANCE(A2,\"datadelay\")",
                    "=GOOGLEFINANCE(A2,\"changepct\")",
                ),
            ),
        )

        restClient.put()
            .uri("/{spreadsheetId}/values/{range}?valueInputOption=USER_ENTERED", properties.spreadsheetId, range)
            .header("Authorization", "Bearer ${accessToken()}")
            .body(body)
            .retrieve()
            .toBodilessEntity()
    }

    fun readMarketData(): MarketDataRow {
        val range = "${properties.sheetName}!A2:E2"
        val response = restClient.get()
            .uri("/{spreadsheetId}/values/{range}?valueRenderOption=UNFORMATTED_VALUE", properties.spreadsheetId, range)
            .header("Authorization", "Bearer ${accessToken()}")
            .retrieve()
            .body(String::class.java)
            ?: error("Google Sheets response is empty")

        val root: JsonNode = objectMapper.readTree(response)
        val values = root.path("values")
        require(values.isArray && !values.isEmpty) { "Google Sheets returned no values" }
        val row = values[0]

        return MarketDataRow(
            googleTicker = row.getOrNull(0)?.asText(),
            price = row.getOrNull(1)?.decimalValue(),
            tradeTime = row.getOrNull(2)?.asText(),
            dataDelay = row.getOrNull(3)?.asInt(),
            changePercent = row.getOrNull(4)?.decimalValue(),
        )
    }

    private fun JsonNode.getOrNull(index: Int): JsonNode? =
        if (isArray && size() > index && !get(index).isNull) get(index) else null
}

data class MarketDataRow(
    val googleTicker: String?,
    val price: java.math.BigDecimal?,
    val tradeTime: String?,
    val dataDelay: Int?,
    val changePercent: java.math.BigDecimal?,
)

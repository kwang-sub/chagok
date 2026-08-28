package com.chagok.poc.google

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "chagok.google-sheets")
data class GoogleSheetsProperties(
    val spreadsheetId: String,
    val sheetName: String = "MarketData",
    val credentialsPath: String,
)

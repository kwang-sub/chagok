package com.chagok.poc

import com.chagok.poc.google.GoogleSheetsClient
import com.chagok.poc.google.MarketDataRow
import com.chagok.poc.publicdata.EtfPriceItem
import com.chagok.poc.publicdata.PublicEtfClient
import org.springframework.stereotype.Service

@Service
class PocService(
    private val publicEtfClient: PublicEtfClient,
    private val googleSheetsClient: GoogleSheetsClient,
) {
    fun latestBaseDate(): String = publicEtfClient.latestBaseDate()

    fun searchEtfs(keyword: String?, page: Int, size: Int): List<EtfPriceItem> =
        publicEtfClient.search(keyword, page, size).response.body.items.item

    fun verifyMarketPrice(ticker: String): PocMarketPriceResponse {
        val etf = requireNotNull(publicEtfClient.findByTicker(ticker)) {
            "ETF not found: $ticker"
        }

        val rowNumber = googleSheetsClient.upsertMarketData(ticker)
        val marketData = googleSheetsClient.readMarketDataWithRetry(rowNumber)

        return PocMarketPriceResponse(
            ticker = ticker,
            name = etf.itmsNm,
            publicDataBaseDate = etf.basDt,
            publicDataClosePrice = etf.clpr,
            googleFinance = marketData,
        )
    }
}

data class PocMarketPriceResponse(
    val ticker: String,
    val name: String?,
    val publicDataBaseDate: String?,
    val publicDataClosePrice: String?,
    val googleFinance: MarketDataRow,
)

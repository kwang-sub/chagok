package com.chagok.poc

import com.chagok.poc.publicdata.EtfPriceItem
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/poc")
class PocController(
    private val pocService: PocService,
) {
    @GetMapping("/etfs/latest-base-date")
    fun latestBaseDate(): ResponseEntity<Map<String, String>> =
        ResponseEntity.ok(mapOf("baseDate" to pocService.latestBaseDate()))

    @GetMapping("/etfs")
    fun searchEtfs(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "1") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
    ): ResponseEntity<List<EtfPriceItem>> =
        ResponseEntity.ok(pocService.searchEtfs(keyword, page, size))

    @PostMapping("/etfs/{ticker}/market-price")
    fun verifyMarketPrice(
        @PathVariable ticker: String,
    ): ResponseEntity<PocMarketPriceResponse> =
        ResponseEntity.ok(pocService.verifyMarketPrice(ticker))
}

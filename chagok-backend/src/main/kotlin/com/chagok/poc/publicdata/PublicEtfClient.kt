package com.chagok.poc.publicdata

import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient
import java.net.URI
import java.net.URLEncoder
import java.nio.charset.StandardCharsets

@Component
class PublicEtfClient(
    restClientBuilder: RestClient.Builder,
    private val properties: PublicDataProperties,
) {
    private val restClient = restClientBuilder.build()

    fun latestBaseDate(): String =
        request(
            linkedMapOf(
                "resultType" to "json",
                "pageNo" to "1",
                "numOfRows" to "1",
            ),
        ).response.body.items.item
            .firstOrNull()
            ?.basDt
            ?: error("공공데이터 API에서 최신 ETF 기준일을 확인할 수 없습니다.")

    fun search(keyword: String?, page: Int, size: Int): EtfPriceApiResponse {
        val queryParams = linkedMapOf(
            "resultType" to "json",
            "basDt" to latestBaseDate(),
            "pageNo" to page.toString(),
            "numOfRows" to size.toString(),
        ).apply {
            if (!keyword.isNullOrBlank()) {
                put("likeItmsNm", keyword)
            }
        }

        return request(queryParams)
    }

    fun findByTicker(ticker: String): EtfPriceItem? {
        return request(
            linkedMapOf(
                "resultType" to "json",
                "basDt" to latestBaseDate(),
                "pageNo" to "1",
                "numOfRows" to "10",
                "likeSrtnCd" to ticker,
            ),
        ).response.body.items.item
            .firstOrNull { it.srtnCd == ticker }
    }

    private fun request(queryParams: Map<String, String>): EtfPriceApiResponse {
        return restClient.get()
            .uri(buildUri(queryParams))
            .retrieve()
            .body(EtfPriceApiResponse::class.java)
            ?: EtfPriceApiResponse()
    }

    private fun buildUri(queryParams: Map<String, String>): URI {
        val query = buildString {
            append("serviceKey=")
            append(encodedServiceKey())

            queryParams.forEach { (name, value) ->
                append('&')
                append(encode(name))
                append('=')
                append(encode(value))
            }
        }

        return URI.create("${properties.baseUrl}/getETFPriceInfo?$query")
    }

    private fun encodedServiceKey(): String {
        val serviceKey = properties.serviceKey.trim()
        require(serviceKey.isNotBlank()) { "PUBLIC_DATA_SERVICE_KEY is required" }

        // 공공데이터포털이 Encoding 키를 제공한 경우 해당 값을 그대로 사용한다.
        // 미인코딩 키인 경우에만 한 번 인코딩하여 이중 인코딩을 방지한다.
        return if ('%' in serviceKey) serviceKey else encode(serviceKey)
    }

    private fun encode(value: String): String =
        URLEncoder.encode(value, StandardCharsets.UTF_8)
}

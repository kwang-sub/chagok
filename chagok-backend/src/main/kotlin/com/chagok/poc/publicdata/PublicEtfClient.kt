package com.chagok.poc.publicdata

import org.springframework.stereotype.Component
import org.springframework.web.client.RestClient

@Component
class PublicEtfClient(
    restClientBuilder: RestClient.Builder,
    private val properties: PublicDataProperties,
) {
    private val restClient = restClientBuilder.baseUrl(properties.baseUrl).build()

    fun search(keyword: String?, page: Int, size: Int): EtfPriceApiResponse {
        return restClient.get()
            .uri { builder ->
                builder.path("/getETFPriceInfo")
                    .queryParam("serviceKey", properties.serviceKey)
                    .queryParam("resultType", "json")
                    .queryParam("pageNo", page)
                    .queryParam("numOfRows", size)
                    .apply {
                        if (!keyword.isNullOrBlank()) {
                            queryParam("itmsNm", keyword)
                        }
                    }
                    .build()
            }
            .retrieve()
            .body(EtfPriceApiResponse::class.java)
            ?: EtfPriceApiResponse()
    }

    fun findByTicker(ticker: String): EtfPriceItem? {
        return restClient.get()
            .uri { builder ->
                builder.path("/getETFPriceInfo")
                    .queryParam("serviceKey", properties.serviceKey)
                    .queryParam("resultType", "json")
                    .queryParam("pageNo", 1)
                    .queryParam("numOfRows", 10)
                    .queryParam("likeSrtnCd", ticker)
                    .build()
            }
            .retrieve()
            .body(EtfPriceApiResponse::class.java)
            ?.response?.body?.items?.item
            ?.firstOrNull { it.srtnCd == ticker }
    }
}

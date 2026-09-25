package com.chagok.poc.publicdata

import com.fasterxml.jackson.annotation.JsonIgnoreProperties

@JsonIgnoreProperties(ignoreUnknown = true)
data class EtfPriceApiResponse(
    val response: ResponseBody = ResponseBody(),
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    data class ResponseBody(
        val body: Body = Body(),
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Body(
        val items: Items = Items(),
        val totalCount: Int = 0,
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class Items(
        val item: List<EtfPriceItem> = emptyList(),
    )
}

@JsonIgnoreProperties(ignoreUnknown = true)
data class EtfPriceItem(
    val basDt: String? = null,
    val srtnCd: String? = null,
    val isinCd: String? = null,
    val itmsNm: String? = null,
    val clpr: String? = null,
    val mkp: String? = null,
    val hipr: String? = null,
    val lopr: String? = null,
    val vs: String? = null,
    val fltRt: String? = null,
    val trqu: String? = null,
    val trPrc: String? = null,
    val nav: String? = null,
    val mrktTotAmt: String? = null,
)

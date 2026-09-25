package com.chagok.poc.publicdata

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties(prefix = "chagok.public-data")
data class PublicDataProperties(
    val baseUrl: String,
    val serviceKey: String,
)

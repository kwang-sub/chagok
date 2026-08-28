package com.chagok.config

import com.chagok.poc.google.GoogleSheetsProperties
import com.chagok.poc.publicdata.PublicDataProperties
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Configuration

@Configuration
@EnableConfigurationProperties(
    PublicDataProperties::class,
    GoogleSheetsProperties::class,
)
class PropertiesConfig

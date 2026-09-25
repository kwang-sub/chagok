package com.chagok

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class ChagokBackendApplication

fun main(args: Array<String>) {
    runApplication<ChagokBackendApplication>(*args)
}

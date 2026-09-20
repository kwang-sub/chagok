package com.chagok.config

import com.nimbusds.jose.JWSAlgorithm
import com.nimbusds.jose.JWSHeader
import com.nimbusds.jose.crypto.RSASSASigner
import com.nimbusds.jose.jwk.JWKSet
import com.nimbusds.jose.jwk.RSAKey
import com.nimbusds.jose.jwk.gen.RSAKeyGenerator
import com.nimbusds.jwt.JWTClaimsSet
import com.nimbusds.jwt.SignedJWT
import com.sun.net.httpserver.HttpServer
import org.junit.jupiter.api.AfterAll
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.EnableAutoConfiguration
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Configuration
import org.springframework.context.annotation.Import
import org.springframework.security.access.prepost.PreAuthorize
import org.springframework.test.context.DynamicPropertyRegistry
import org.springframework.test.context.DynamicPropertySource
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.content
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import java.net.InetSocketAddress
import java.security.Principal
import java.time.Instant
import java.util.Date

@SpringBootTest(classes = [SecurityConfigTests.TestApplication::class])
@AutoConfigureMockMvc
class SecurityConfigTests @Autowired constructor(private val mvc: MockMvc) {
    @Configuration
    @EnableAutoConfiguration
    @Import(SecurityConfig::class, TestEndpoints::class)
    class TestApplication

    // Test-only endpoints exercise the real filter chain without remote PoC services.
    @RestController
    class TestEndpoints {
        @GetMapping("/api/test/identity")
        fun identity(principal: Principal): String = principal.name

        @PostMapping("/api/test/identity")
        fun write(principal: Principal): String = principal.name

        @PreAuthorize("hasAuthority('SCOPE_admin')")
        @GetMapping("/api/test/denied")
        fun denied(): String = "allowed"
    }

    @Test
    fun `missing malformed and spoofed credentials return 401 for all api methods`() {
        mvc.perform(get("/api/poc/etfs")).andExpect(status().isUnauthorized)
        mvc.perform(post("/api/poc/etfs/test/market-price")).andExpect(status().isUnauthorized)
        mvc.perform(get("/api/test/identity").header("Authorization", "Bearer malformed"))
            .andExpect(status().isUnauthorized)
        mvc.perform(get("/api/test/identity").header("X-User-Id", "spoofed"))
            .andExpect(status().isUnauthorized)
    }

    @Test
    fun `signed valid token supplies only validated subject as identity`() {
        mvc.perform(get("/api/test/identity").header("Authorization", "Bearer ${token()}")
            .header("X-User-Id", "spoofed"))
            .andExpect(status().isOk).andExpect(content().string(SUBJECT))
        mvc.perform(post("/api/test/identity").header("Authorization", "Bearer ${token()}"))
            .andExpect(status().isOk).andExpect(content().string(SUBJECT))
    }

    @Test
    fun `invalid signature issuer expiry and missing required claims return 401`() {
        val invalidTokens = listOf(
            token(signingKey = RSAKeyGenerator(2048).keyID("test").generate()),
            token(issuer = "https://wrong.invalid/auth/v1"),
            token(expiresAt = Instant.now().minusSeconds(120)),
            token(expiresAt = null),
            token(subject = null),
            token(subject = " "),
            token(notBefore = Instant.now().plusSeconds(300)),
        )
        invalidTokens.forEach { invalid ->
            mvc.perform(get("/api/test/identity").header("Authorization", "Bearer $invalid"))
                .andExpect(status().isUnauthorized)
        }
    }

    @Test
    fun `authenticated but insufficient authority is 403 not 401`() {
        mvc.perform(get("/api/test/denied").header("Authorization", "Bearer ${token()}"))
            .andExpect(status().isForbidden)
        mvc.perform(get("/api/test/denied").header("Authorization", "Bearer ${token(scope = "admin")}"))
            .andExpect(status().isOk)
    }

    companion object {
        private const val ISSUER = "https://test.invalid/auth/v1"
        private const val SUBJECT = "00000000-0000-4000-8000-000000000001"
        private val key = RSAKeyGenerator(2048).keyID("test").generate()
        private val jwksServer = HttpServer.create(InetSocketAddress("127.0.0.1", 0), 0).apply {
            createContext("/jwks") { exchange ->
                val bytes = JWKSet(key.toPublicJWK()).toString().toByteArray()
                exchange.responseHeaders.set("Content-Type", "application/json")
                exchange.sendResponseHeaders(200, bytes.size.toLong())
                exchange.responseBody.use { it.write(bytes) }
            }
            start()
        }

        @JvmStatic
        @DynamicPropertySource
        fun properties(registry: DynamicPropertyRegistry) {
            registry.add("spring.security.oauth2.resourceserver.jwt.issuer-uri") { ISSUER }
            registry.add("spring.security.oauth2.resourceserver.jwt.jwk-set-uri") {
                "http://127.0.0.1:${jwksServer.address.port}/jwks"
            }
        }

        @JvmStatic
        @AfterAll
        fun stopServer() = jwksServer.stop(0)

        private fun token(
            signingKey: RSAKey = key,
            issuer: String = ISSUER,
            subject: String? = SUBJECT,
            expiresAt: Instant? = Instant.now().plusSeconds(300),
            notBefore: Instant = Instant.now().minusSeconds(1),
            scope: String = "",
        ): String {
            val claims = JWTClaimsSet.Builder().issuer(issuer).subject(subject)
                .issueTime(Date.from(Instant.now())).notBeforeTime(Date.from(notBefore))
                .claim("scope", scope).claim("email", "not-an-identity")
            if (expiresAt != null) claims.expirationTime(Date.from(expiresAt))
            val jwt = SignedJWT(JWSHeader.Builder(JWSAlgorithm.RS256).keyID("test").build(), claims.build())
            jwt.sign(RSASSASigner(signingKey))
            return jwt.serialize()
        }
    }
}

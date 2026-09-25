package com.chagok.config

import jakarta.servlet.DispatcherType
import org.springframework.boot.autoconfigure.security.oauth2.resource.OAuth2ResourceServerProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2Error
import org.springframework.security.oauth2.core.OAuth2TokenValidator
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult
import org.springframework.security.oauth2.jose.jws.SignatureAlgorithm
import org.springframework.security.oauth2.jwt.Jwt
import org.springframework.security.oauth2.jwt.JwtDecoder
import org.springframework.security.oauth2.jwt.JwtValidators
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler
import org.springframework.security.web.SecurityFilterChain

@Configuration
@EnableMethodSecurity
class SecurityConfig {
    /** Stateless bearer-only API: browser cookies/basic auth are not accepted credentials. */
    @Bean
    fun securityFilterChain(http: HttpSecurity): SecurityFilterChain {
        http.csrf { it.disable() }
            .sessionManagement { it.sessionCreationPolicy(SessionCreationPolicy.STATELESS) }
            .authorizeHttpRequests {
                it.dispatcherTypeMatchers(DispatcherType.ERROR).permitAll()
                    .requestMatchers("/api/**").authenticated()
                    .anyRequest().denyAll()
            }
            .oauth2ResourceServer {
                it.jwt { }
                    .authenticationEntryPoint(BearerTokenAuthenticationEntryPoint())
                    .accessDeniedHandler(BearerTokenAccessDeniedHandler())
            }
        return http.build()
    }

    /** Only asymmetric Supabase keys are trusted; JwtAuthenticationToken.name is validated sub. */
    @Bean
    fun jwtDecoder(properties: OAuth2ResourceServerProperties): JwtDecoder {
        val jwt = properties.jwt
        val decoder = NimbusJwtDecoder.withJwkSetUri(jwt.jwkSetUri)
            .jwsAlgorithm(SignatureAlgorithm.RS256)
            .jwsAlgorithm(SignatureAlgorithm.ES256)
            .build()
        val requiredClaims = OAuth2TokenValidator<Jwt> { token ->
            if (token.subject.isNullOrBlank() || token.expiresAt == null) {
                OAuth2TokenValidatorResult.failure(OAuth2Error("invalid_token", "Required claims missing", null))
            } else {
                OAuth2TokenValidatorResult.success()
            }
        }
        decoder.setJwtValidator(DelegatingOAuth2TokenValidator(
            JwtValidators.createDefaultWithIssuer(jwt.issuerUri), requiredClaims,
        ))
        return decoder
    }
}

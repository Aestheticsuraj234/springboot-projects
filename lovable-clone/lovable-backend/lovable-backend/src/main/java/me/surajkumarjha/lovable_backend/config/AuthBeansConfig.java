package me.surajkumarjha.lovable_backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AuthBeansConfig {

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    @Qualifier("lovableObjectMapper")
    ObjectMapper lovableObjectMapper() {
        return new ObjectMapper();
    }

    @Bean
    RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    JwtProperties jwtProperties(
            @Value("${lovable.jwt.secret}") String secret,
            @Value("${lovable.jwt.access-token-expiration-minutes}") long accessTokenExpirationMinutes,
            @Value("${lovable.jwt.refresh-token-expiration-days}") long refreshTokenExpirationDays
    ) {
        return new JwtProperties(secret, accessTokenExpirationMinutes, refreshTokenExpirationDays);
    }

    public record JwtProperties(
            String secret,
            long accessTokenExpirationMinutes,
            long refreshTokenExpirationDays
    ) {
    }
}

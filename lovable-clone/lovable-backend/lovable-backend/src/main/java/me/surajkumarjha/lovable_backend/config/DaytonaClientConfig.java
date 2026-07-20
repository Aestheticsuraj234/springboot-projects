package me.surajkumarjha.lovable_backend.config;

import io.daytona.sdk.Daytona;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties(DaytonaProperties.class)
public class DaytonaClientConfig {

    @Bean(destroyMethod = "close")
    @ConditionalOnProperty(prefix = "lovable.daytona", name = "enabled", havingValue = "true")
    Daytona daytonaClient(DaytonaProperties properties) {
        io.daytona.sdk.DaytonaConfig config = new io.daytona.sdk.DaytonaConfig.Builder()
                .apiKey(properties.apiKey())
                .apiUrl(properties.apiUrl())
                .target(properties.target())
                .build();
        return new Daytona(config);
    }
}

package me.surajkumarjha.lovable_backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "lovable.daytona")
public record DaytonaProperties(
        boolean enabled,
        String apiKey,
        String apiUrl,
        String target,
        String snapshot,
        int previewPort,
        int previewExpirySeconds,
        int commandTimeoutSeconds
) {
    public DaytonaProperties {
        if (apiUrl == null || apiUrl.isBlank()) {
            apiUrl = "https://app.daytona.io/api";
        }
        if (target == null || target.isBlank()) {
            target = "us";
        }
        if (previewPort <= 0) {
            previewPort = 5173;
        }
        if (previewExpirySeconds <= 0) {
            previewExpirySeconds = 3600;
        }
        if (commandTimeoutSeconds <= 0) {
            commandTimeoutSeconds = 300;
        }
    }

    public boolean isConfigured() {
        return enabled && apiKey != null && !apiKey.isBlank();
    }
}

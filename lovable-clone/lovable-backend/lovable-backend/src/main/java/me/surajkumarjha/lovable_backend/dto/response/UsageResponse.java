package me.surajkumarjha.lovable_backend.dto.response;

import me.surajkumarjha.lovable_backend.entity.Usage;

import java.time.Instant;

public record UsageResponse(
        String key,
        Integer points,
        Instant expire
) {
    public static UsageResponse from(Usage usage) {
        return new UsageResponse(usage.getKey(), usage.getPoints(), usage.getExpire());
    }
}

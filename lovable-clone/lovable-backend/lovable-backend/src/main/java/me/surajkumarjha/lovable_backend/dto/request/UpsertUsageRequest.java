package me.surajkumarjha.lovable_backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;

public record UpsertUsageRequest(
        @NotBlank String key,
        @NotNull @Min(0) Integer points,
        Instant expire
) {
}

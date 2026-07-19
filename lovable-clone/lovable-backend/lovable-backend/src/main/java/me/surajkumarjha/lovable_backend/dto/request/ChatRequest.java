package me.surajkumarjha.lovable_backend.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank String content
) {
}

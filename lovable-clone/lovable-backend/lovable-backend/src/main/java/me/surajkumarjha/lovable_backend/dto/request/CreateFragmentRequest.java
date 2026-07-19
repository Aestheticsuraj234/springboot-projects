package me.surajkumarjha.lovable_backend.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record CreateFragmentRequest(
        @NotBlank String sandboxUrl,
        @NotBlank String title,
        @NotNull JsonNode files
) {
}

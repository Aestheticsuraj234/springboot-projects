package me.surajkumarjha.lovable_backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Map;

public record CreateFragmentRequest(
        @NotBlank String sandboxUrl,
        @NotBlank String title,
        @NotNull @NotEmpty Map<String, String> files
) {
}

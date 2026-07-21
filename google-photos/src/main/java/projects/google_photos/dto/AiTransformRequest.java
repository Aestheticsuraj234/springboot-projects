package projects.google_photos.dto;

import jakarta.validation.constraints.NotNull;
import projects.google_photos.domain.AiTransformType;

public record AiTransformRequest(
        @NotNull AiTransformType type,
        String prompt,
        Integer width,
        Integer height,
        String focusObject
) {
}

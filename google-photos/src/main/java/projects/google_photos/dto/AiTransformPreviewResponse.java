package projects.google_photos.dto;

import projects.google_photos.domain.AiTransformType;

public record AiTransformPreviewResponse(
        String previewUrl,
        AiTransformType type,
        String transformChain
) {
}

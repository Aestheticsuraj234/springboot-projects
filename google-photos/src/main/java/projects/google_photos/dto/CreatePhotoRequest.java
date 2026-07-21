package projects.google_photos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

public record CreatePhotoRequest(
        @NotBlank String imagekitFileId,
        @NotBlank String fileName,
        @NotBlank String url,
        String thumbnailUrl,
        String mimeType,
        @NotNull @PositiveOrZero Long sizeBytes,
        Integer width,
        Integer height
) {
}

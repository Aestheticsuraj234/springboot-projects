package projects.google_photos.dto;

import projects.google_photos.domain.PhotoStatus;

import java.time.Instant;
import java.util.UUID;

public record PhotoResponse(
        UUID id,
        String imagekitFileId,
        String fileName,
        String url,
        String thumbnailUrl,
        String mimeType,
        Long sizeBytes,
        Integer width,
        Integer height,
        PhotoStatus status,
        Instant createdAt,
        Instant deletedAt
) {
}

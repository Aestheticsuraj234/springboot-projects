package projects.google_photos.dto;

import java.time.Instant;
import java.util.UUID;

public record AlbumResponse(
        UUID id,
        String title,
        UUID coverPhotoId,
        String coverThumbnailUrl,
        long photoCount,
        Instant createdAt,
        Instant updatedAt
) {
}

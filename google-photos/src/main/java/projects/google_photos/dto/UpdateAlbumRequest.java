package projects.google_photos.dto;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record UpdateAlbumRequest(
        @Size(min = 1, max = 255) String title,
        UUID coverPhotoId
) {
}

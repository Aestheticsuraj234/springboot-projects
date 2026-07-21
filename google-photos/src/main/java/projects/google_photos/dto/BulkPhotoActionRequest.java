package projects.google_photos.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;
import java.util.UUID;

public record BulkPhotoActionRequest(
        @NotEmpty List<UUID> photoIds
) {
}

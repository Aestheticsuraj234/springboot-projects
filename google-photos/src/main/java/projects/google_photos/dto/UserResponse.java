package projects.google_photos.dto;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String email,
        String displayName
) {
}

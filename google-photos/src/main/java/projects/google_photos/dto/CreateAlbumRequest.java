package projects.google_photos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateAlbumRequest(
        @NotBlank @Size(min = 1, max = 255) String title
) {
}

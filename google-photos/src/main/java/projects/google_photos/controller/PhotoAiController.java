package projects.google_photos.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import projects.google_photos.domain.User;
import projects.google_photos.dto.AiTransformPreviewResponse;
import projects.google_photos.dto.AiTransformRequest;
import projects.google_photos.dto.PhotoResponse;
import projects.google_photos.service.AiTransformService;
import projects.google_photos.service.UserService;

import java.util.UUID;

@RestController
@RequestMapping("/api/photos/{photoId}/ai")
public class PhotoAiController {

    private final AiTransformService aiTransformService;
    private final UserService userService;

    public PhotoAiController(AiTransformService aiTransformService, UserService userService) {
        this.aiTransformService = aiTransformService;
        this.userService = userService;
    }

    @PostMapping("/preview")
    public ResponseEntity<AiTransformPreviewResponse> preview(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID photoId,
            @Valid @RequestBody AiTransformRequest request
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(aiTransformService.preview(user, photoId, request));
    }

    @PostMapping("/apply")
    public ResponseEntity<PhotoResponse> apply(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable UUID photoId,
            @Valid @RequestBody AiTransformRequest request
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        PhotoResponse photo = aiTransformService.apply(user, photoId, request);
        return ResponseEntity.ok(photo);
    }
}

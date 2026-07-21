package projects.google_photos.controller;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import projects.google_photos.domain.User;
import projects.google_photos.dto.ImageKitAssetResponse;
import projects.google_photos.dto.ImportPhotosRequest;
import projects.google_photos.dto.PhotoResponse;
import projects.google_photos.dto.StorageUsageResponse;
import projects.google_photos.service.LibraryService;
import projects.google_photos.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/library")
public class LibraryController {

    private final LibraryService libraryService;
    private final UserService userService;

    public LibraryController(LibraryService libraryService, UserService userService) {
        this.libraryService = libraryService;
        this.userService = userService;
    }

    @GetMapping("/storage")
    public ResponseEntity<StorageUsageResponse> getStorageUsage(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(libraryService.getStorageUsage(user));
    }

    @GetMapping("/imagekit-assets")
    public ResponseEntity<List<ImageKitAssetResponse>> listImageKitAssets(
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(libraryService.listImportableAssets(user));
    }

    @PostMapping("/import")
    public ResponseEntity<List<PhotoResponse>> importAssets(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody ImportPhotosRequest request
    ) {
        User user = userService.getByEmail(userDetails.getUsername());
        return ResponseEntity.ok(libraryService.importAssets(user, request));
    }
}

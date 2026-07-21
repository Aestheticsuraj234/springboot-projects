package projects.google_photos.service;

import io.imagekit.models.files.FileUploadResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import projects.google_photos.domain.Photo;
import projects.google_photos.domain.PhotoStatus;
import projects.google_photos.domain.User;
import projects.google_photos.dto.CreatePhotoRequest;
import projects.google_photos.dto.PageResponse;
import projects.google_photos.dto.PhotoResponse;
import projects.google_photos.exception.BadRequestException;
import projects.google_photos.exception.ResourceConflictException;
import projects.google_photos.exception.ResourceNotFoundException;
import projects.google_photos.repository.PhotoRepository;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class PhotoService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
            "image/heic",
            "image/heif"
    );

    private final PhotoRepository photoRepository;
    private final ImageKitService imageKitService;

    public PhotoService(PhotoRepository photoRepository, ImageKitService imageKitService) {
        this.photoRepository = photoRepository;
        this.imageKitService = imageKitService;
    }

    @Transactional(readOnly = true)
    public PageResponse<PhotoResponse> listPhotos(User user, PhotoStatus status, Pageable pageable) {
        Page<Photo> page = photoRepository.findByUserIdAndStatus(user.getId(), status, pageable);
        return toPageResponse(page);
    }

    @Transactional
    public PhotoResponse uploadPhoto(User user, MultipartFile file) {
        validateUpload(file);

        FileUploadResponse uploadResponse = imageKitService.uploadPhoto(user, file);

        String fileId = uploadResponse.fileId()
                .orElseThrow(() -> new BadRequestException("ImageKit did not return a file id"));
        String url = uploadResponse.url()
                .orElseThrow(() -> new BadRequestException("ImageKit did not return a file url"));
        String filePath = uploadResponse.filePath().orElse(null);

        CreatePhotoRequest request = new CreatePhotoRequest(
                fileId,
                uploadResponse.name().orElse(file.getOriginalFilename()),
                url,
                uploadResponse.thumbnailUrl().orElse(null),
                file.getContentType(),
                uploadResponse.size().map(Double::longValue).orElse(file.getSize()),
                uploadResponse.width().map(Double::intValue).orElse(null),
                uploadResponse.height().map(Double::intValue).orElse(null)
        );

        PhotoResponse photo = createPhoto(user, request);

        if (filePath != null && (photo.thumbnailUrl() == null || photo.thumbnailUrl().isBlank())) {
            Photo savedPhoto = photoRepository.findById(photo.id())
                    .orElseThrow(() -> new ResourceNotFoundException("Photo not found"));
            savedPhoto.setThumbnailUrl(imageKitService.buildThumbnailUrl(filePath));
            return toPhotoResponse(photoRepository.save(savedPhoto));
        }

        return photo;
    }

    @Transactional
    public PhotoResponse createPhoto(User user, CreatePhotoRequest request) {
        if (photoRepository.existsByImagekitFileIdAndUserId(request.imagekitFileId(), user.getId())) {
            throw new ResourceConflictException("Photo already exists in your library");
        }

        String thumbnailUrl = request.thumbnailUrl();
        if (thumbnailUrl == null || thumbnailUrl.isBlank()) {
            thumbnailUrl = imageKitService.buildThumbnailUrlFromUrl(request.url());
        }

        Photo photo = Photo.builder()
                .user(user)
                .imagekitFileId(request.imagekitFileId())
                .fileName(request.fileName())
                .url(request.url())
                .thumbnailUrl(thumbnailUrl)
                .mimeType(request.mimeType())
                .sizeBytes(request.sizeBytes())
                .width(request.width())
                .height(request.height())
                .status(PhotoStatus.ACTIVE)
                .build();

        return toPhotoResponse(photoRepository.save(photo));
    }

    @Transactional
    public void archivePhotos(User user, List<UUID> photoIds) {
        updatePhotoStatus(user, photoIds, PhotoStatus.ACTIVE, PhotoStatus.ARCHIVED, false);
    }

    @Transactional
    public void movePhotosToTrash(User user, List<UUID> photoIds) {
        List<Photo> photos = loadOwnedPhotos(user, photoIds);

        for (Photo photo : photos) {
            if (photo.getStatus() == PhotoStatus.TRASH) {
                continue;
            }
            photo.setStatus(PhotoStatus.TRASH);
            photo.setDeletedAt(Instant.now());
        }
    }

    @Transactional
    public void restorePhotos(User user, List<UUID> photoIds) {
        List<Photo> photos = photoRepository.findByIdInAndUserId(photoIds, user.getId());
        if (photos.size() != photoIds.size()) {
            throw new ResourceNotFoundException("One or more photos were not found");
        }

        for (Photo photo : photos) {
            if (photo.getStatus() == PhotoStatus.ACTIVE) {
                continue;
            }
            photo.setStatus(PhotoStatus.ACTIVE);
            photo.setDeletedAt(null);
        }
    }

    @Transactional
    public void permanentlyDeletePhotos(User user, List<UUID> photoIds) {
        List<Photo> photos = photoRepository.findByIdInAndUserId(photoIds, user.getId());
        if (photos.size() != photoIds.size()) {
            throw new ResourceNotFoundException("One or more photos were not found");
        }

        for (Photo photo : photos) {
            if (photo.getStatus() != PhotoStatus.TRASH) {
                throw new BadRequestException("Only photos in trash can be permanently deleted");
            }
            imageKitService.deleteFile(photo.getImagekitFileId());
            photoRepository.delete(photo);
        }
    }

    @Transactional
    public void permanentlyDeletePhoto(User user, UUID photoId) {
        permanentlyDeletePhotos(user, List.of(photoId));
    }

    private void updatePhotoStatus(
            User user,
            List<UUID> photoIds,
            PhotoStatus requiredCurrentStatus,
            PhotoStatus newStatus,
            boolean setDeletedAt
    ) {
        List<Photo> photos = loadOwnedPhotos(user, photoIds);

        for (Photo photo : photos) {
            if (requiredCurrentStatus != null && photo.getStatus() != requiredCurrentStatus) {
                throw new BadRequestException("Photo must be " + requiredCurrentStatus.name().toLowerCase());
            }
            photo.setStatus(newStatus);
            photo.setDeletedAt(setDeletedAt ? Instant.now() : null);
        }
    }

    private List<Photo> loadOwnedPhotos(User user, List<UUID> photoIds) {
        List<Photo> photos = photoRepository.findByIdInAndUserId(photoIds, user.getId());
        if (photos.size() != photoIds.size()) {
            throw new ResourceNotFoundException("One or more photos were not found");
        }
        return photos;
    }

    private void validateUpload(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Uploaded file is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Only image files are allowed (JPEG, PNG, WebP, GIF, HEIC)");
        }
    }

    private PageResponse<PhotoResponse> toPageResponse(Page<Photo> page) {
        return new PageResponse<>(
                page.getContent().stream().map(this::toPhotoResponse).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    public PhotoResponse toPhotoResponse(Photo photo) {
        return new PhotoResponse(
                photo.getId(),
                photo.getImagekitFileId(),
                photo.getFileName(),
                photo.getUrl(),
                photo.getThumbnailUrl(),
                photo.getMimeType(),
                photo.getSizeBytes(),
                photo.getWidth(),
                photo.getHeight(),
                photo.getStatus(),
                photo.getCreatedAt(),
                photo.getDeletedAt()
        );
    }
}

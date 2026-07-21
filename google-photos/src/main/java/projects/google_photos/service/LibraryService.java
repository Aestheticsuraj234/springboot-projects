package projects.google_photos.service;

import io.imagekit.models.assets.AssetListResponse;
import io.imagekit.models.files.File;
import io.imagekit.models.files.FileUploadResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import projects.google_photos.domain.PhotoStatus;
import projects.google_photos.domain.User;
import projects.google_photos.dto.CreatePhotoRequest;
import projects.google_photos.dto.ImageKitAssetResponse;
import projects.google_photos.dto.ImportPhotosRequest;
import projects.google_photos.dto.PhotoResponse;
import projects.google_photos.dto.StorageUsageResponse;
import projects.google_photos.exception.ResourceNotFoundException;
import projects.google_photos.repository.PhotoRepository;

import java.util.ArrayList;
import java.util.List;

@Service
public class LibraryService {

    private final PhotoRepository photoRepository;
    private final ImageKitService imageKitService;
    private final PhotoService photoService;

    public LibraryService(
            PhotoRepository photoRepository,
            ImageKitService imageKitService,
            PhotoService photoService
    ) {
        this.photoRepository = photoRepository;
        this.imageKitService = imageKitService;
        this.photoService = photoService;
    }

    @Transactional(readOnly = true)
    public StorageUsageResponse getStorageUsage(User user) {
        long usedBytes = photoRepository.sumActivePhotoBytesByUserId(user.getId());
        long photoCount = photoRepository.countByUserIdAndStatus(user.getId(), PhotoStatus.ACTIVE);
        return new StorageUsageResponse(usedBytes, photoCount, null, null);
    }

    @Transactional(readOnly = true)
    public List<ImageKitAssetResponse> listImportableAssets(User user) {
        String folder = ImageKitService.userFolder(user.getId());
        List<AssetListResponse> assets = imageKitService.listAssetsInFolder(folder, 0, 100);

        List<ImageKitAssetResponse> responses = new ArrayList<>();
        for (AssetListResponse asset : assets) {
            if (!asset.isFile()) {
                continue;
            }

            File file = asset.asFile();
            String fileId = file.fileId().orElse(null);
            if (fileId == null) {
                continue;
            }

            String url = file.url().orElse("");
            responses.add(new ImageKitAssetResponse(
                    fileId,
                    file.name().orElse("Untitled"),
                    url,
                    file.thumbnail().orElse(url),
                    file.size().map(Double::longValue).orElse(0L),
                    file.width().map(Double::intValue).orElse(null),
                    file.height().map(Double::intValue).orElse(null),
                    file.mime().orElse(null),
                    photoRepository.existsByImagekitFileIdAndUserId(fileId, user.getId())
            ));
        }

        return responses;
    }

    @Transactional
    public List<PhotoResponse> importAssets(User user, ImportPhotosRequest request) {
        List<PhotoResponse> imported = new ArrayList<>();

        for (String fileId : request.imagekitFileIds()) {
            if (photoRepository.existsByImagekitFileIdAndUserId(fileId, user.getId())) {
                continue;
            }

            File file = findFile(user, fileId);
            CreatePhotoRequest createRequest = new CreatePhotoRequest(
                    fileId,
                    file.name().orElse("imported-photo"),
                    file.url().orElseThrow(() -> new ResourceNotFoundException("Asset URL missing")),
                    file.thumbnail().orElse(null),
                    file.mime().orElse(null),
                    file.size().map(Double::longValue).orElse(0L),
                    file.width().map(Double::intValue).orElse(null),
                    file.height().map(Double::intValue).orElse(null)
            );

            imported.add(photoService.createPhoto(user, createRequest));
        }

        return imported;
    }

    private File findFile(User user, String fileId) {
        return imageKitService.listAssetsInFolder(ImageKitService.userFolder(user.getId()), 0, 100).stream()
                .filter(AssetListResponse::isFile)
                .map(AssetListResponse::asFile)
                .filter(file -> file.fileId().map(fileId::equals).orElse(false))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("ImageKit asset not found"));
    }
}

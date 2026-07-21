package projects.google_photos.service;

import io.imagekit.client.ImageKitClient;
import io.imagekit.errors.ImageKitException;
import io.imagekit.models.SrcOptions;
import io.imagekit.models.Transformation;
import io.imagekit.models.files.FileDeleteParams;
import io.imagekit.models.files.FileUploadParams;
import io.imagekit.models.files.FileUploadResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import projects.google_photos.config.ImageKitProperties;
import projects.google_photos.domain.User;
import projects.google_photos.exception.ImageKitUploadException;
import projects.google_photos.exception.BadRequestException;

import java.io.IOException;
import java.util.UUID;

@Service
public class ImageKitService {

    private final ImageKitClient imageKitClient;
    private final ImageKitProperties imageKitProperties;

    public ImageKitService(ImageKitClient imageKitClient, ImageKitProperties imageKitProperties) {
        this.imageKitClient = imageKitClient;
        this.imageKitProperties = imageKitProperties;
    }

    public FileUploadResponse uploadPhoto(User user, MultipartFile file) {
        try {
            FileUploadParams params = FileUploadParams.builder()
                    .file(file.getBytes())
                    .fileName(resolveFileName(file))
                    .folder(userFolder(user.getId()))
                    .useUniqueFileName(true)
                    .build();

            return imageKitClient.files().upload(params);
        } catch (ImageKitException ex) {
            throw new ImageKitUploadException("ImageKit upload failed: " + ex.getMessage(), ex);
        } catch (IOException ex) {
            throw new ImageKitUploadException("Failed to read uploaded file", ex);
        }
    }

    public void deleteFile(String fileId) {
        try {
            imageKitClient.files().delete(
                    FileDeleteParams.builder()
                            .fileId(fileId)
                            .build()
            );
        } catch (ImageKitException ex) {
            throw new ImageKitUploadException("ImageKit delete failed: " + ex.getMessage(), ex);
        }
    }

    public String buildThumbnailUrl(String filePath) {
        if (filePath == null || filePath.isBlank()) {
            return filePath;
        }

        String src = filePath.startsWith("/") ? filePath : "/" + filePath;

        return imageKitClient.helper().buildUrl(
                SrcOptions.builder()
                        .urlEndpoint(imageKitProperties.urlEndpoint())
                        .src(src)
                        .addTransformation(
                                Transformation.builder()
                                        .width(400.0)
                                        .height(400.0)
                                        .focus("auto")
                                        .build()
                        )
                        .build()
        );
    }

    public String buildThumbnailUrlFromUrl(String url) {
        if (url == null || url.isBlank()) {
            return url;
        }
        String separator = url.contains("?") ? "&" : "?";
        return url + separator + "tr=w-400,h-400,fo-auto";
    }

    public static String userFolder(UUID userId) {
        return "/users/" + userId;
    }

    private String resolveFileName(MultipartFile file) {
        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.isBlank()) {
            throw new BadRequestException("File name is required");
        }
        return originalName;
    }
}

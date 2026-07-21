package projects.google_photos.service;

import org.springframework.stereotype.Service;
import projects.google_photos.domain.AiTransformType;
import projects.google_photos.domain.Photo;
import projects.google_photos.domain.User;
import projects.google_photos.dto.AiTransformPreviewResponse;
import projects.google_photos.dto.AiTransformRequest;
import projects.google_photos.dto.PhotoResponse;
import projects.google_photos.exception.BadRequestException;
import projects.google_photos.exception.ResourceNotFoundException;
import projects.google_photos.repository.PhotoRepository;

import java.util.UUID;

@Service
public class AiTransformService {

    private final PhotoRepository photoRepository;
    private final ImageKitService imageKitService;
    private final PhotoService photoService;

    public AiTransformService(
            PhotoRepository photoRepository,
            ImageKitService imageKitService,
            PhotoService photoService
    ) {
        this.photoRepository = photoRepository;
        this.imageKitService = imageKitService;
        this.photoService = photoService;
    }

    public AiTransformPreviewResponse preview(User user, UUID photoId, AiTransformRequest request) {
        Photo photo = getActivePhoto(user, photoId);
        String transformChain = buildTransformChain(request, photo);
        String previewUrl = imageKitService.buildAiTransformUrl(photo.getUrl(), transformChain);

        return new AiTransformPreviewResponse(previewUrl, request.type(), transformChain);
    }

    public PhotoResponse apply(User user, UUID photoId, AiTransformRequest request) {
        Photo photo = getActivePhoto(user, photoId);
        String transformChain = buildTransformChain(request, photo);
        String transformUrl = imageKitService.buildAiTransformUrl(photo.getUrl(), transformChain);
        byte[] transformedBytes = imageKitService.downloadTransformedImage(transformUrl);

        String suffix = request.type().name().toLowerCase().replace('_', '-');
        String fileName = buildDerivedFileName(photo.getFileName(), suffix);

        var uploadResponse = imageKitService.uploadBytes(user, transformedBytes, fileName);
        return photoService.createDerivedPhoto(user, photo, uploadResponse, request.type());
    }

    private Photo getActivePhoto(User user, UUID photoId) {
        return photoRepository.findByIdAndUserId(photoId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Photo not found"));
    }

    private String buildDerivedFileName(String originalFileName, String suffix) {
        int dotIndex = originalFileName.lastIndexOf('.');
        if (dotIndex <= 0) {
            return originalFileName + "-ai-" + suffix + ".png";
        }
        String base = originalFileName.substring(0, dotIndex);
        String extension = originalFileName.substring(dotIndex);
        return base + "-ai-" + suffix + extension;
    }

    String buildTransformChain(AiTransformRequest request, Photo photo) {
        return switch (request.type()) {
            case REMOVE_BACKGROUND -> "e-bgremove";
            case BACKGROUND_AND_SHADOW -> "e-bgremove:e-dropshadow";
            case CHANGE_BACKGROUND -> {
                requirePrompt(request);
                yield "e-changebg-prompt-" + urlEncodePrompt(request.prompt());
            }
            case GENERATIVE_FILL -> {
                int width = requireDimension(request.width(), "width");
                int height = requireDimension(request.height(), "height");
                if (request.prompt() != null && !request.prompt().isBlank()) {
                    yield "bg-genfill-prompt-" + urlEncodePrompt(request.prompt())
                            + ",w-" + width + ",h-" + height + ",cm-pad_resize";
                }
                yield "bg-genfill,w-" + width + ",h-" + height + ",cm-pad_resize";
            }
            case SMART_CROP -> {
                int width = requireDimension(request.width(), "width");
                int height = requireDimension(request.height(), "height");
                yield "w-" + width + ",h-" + height + ",fo-auto";
            }
            case OBJECT_CROP -> {
                requireFocusObject(request);
                yield "fo-" + sanitizeFocusObject(request.focusObject());
            }
            case RETOUCH -> "e-retouch";
            case UPSCALE -> "e-upscale";
            case AI_EDIT -> {
                requirePrompt(request);
                yield "e-edit-prompt-" + urlEncodePrompt(request.prompt());
            }
        };
    }

    private void requirePrompt(AiTransformRequest request) {
        if (request.prompt() == null || request.prompt().isBlank()) {
            throw new BadRequestException("Prompt is required for this transformation");
        }
    }

    private void requireFocusObject(AiTransformRequest request) {
        if (request.focusObject() == null || request.focusObject().isBlank()) {
            throw new BadRequestException("Focus object is required for object-aware cropping");
        }
    }

    private int requireDimension(Integer value, String name) {
        if (value == null || value < 64 || value > 4096) {
            throw new BadRequestException(name + " must be between 64 and 4096 pixels");
        }
        return value;
    }

    private String sanitizeFocusObject(String focusObject) {
        return focusObject.trim().toLowerCase().replaceAll("[^a-z0-9_-]", "");
    }

    private String urlEncodePrompt(String prompt) {
        return java.net.URLEncoder.encode(prompt.trim(), java.nio.charset.StandardCharsets.UTF_8);
    }
}

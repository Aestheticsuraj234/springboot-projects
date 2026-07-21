package projects.google_photos.dto;

public record StorageUsageResponse(
        long libraryUsedBytes,
        long libraryPhotoCount,
        Long imagekitBandwidthBytes,
        Long imagekitStorageBytes
) {
}

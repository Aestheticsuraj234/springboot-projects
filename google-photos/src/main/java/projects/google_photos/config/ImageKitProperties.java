package projects.google_photos.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "imagekit")
public record ImageKitProperties(
        String publicKey,
        String privateKey,
        String urlEndpoint
) {
    public boolean isConfigured() {
        return publicKey != null && !publicKey.isBlank()
                && privateKey != null && !privateKey.isBlank()
                && urlEndpoint != null && !urlEndpoint.isBlank();
    }
}

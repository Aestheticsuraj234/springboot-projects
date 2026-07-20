package me.surajkumarjha.lovable_backend.service;

import io.daytona.api.client.model.SignedPortPreviewUrl;
import io.daytona.sdk.Daytona;
import io.daytona.sdk.Sandbox;
import io.daytona.sdk.model.CreateSandboxFromImageParams;
import io.daytona.sdk.model.CreateSandboxFromSnapshotParams;
import io.daytona.sdk.model.ExecuteResponse;
import io.daytona.sdk.model.SessionExecuteRequest;
import lombok.extern.slf4j.Slf4j;
import me.surajkumarjha.lovable_backend.config.DaytonaProperties;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Service
@Slf4j
public class DaytonaSandboxService {

    private final DaytonaProperties properties;
    private final ObjectProvider<Daytona> daytonaProvider;
    private final DaytonaPreviewTemplateService templateService;
    private final RestTemplate restTemplate;

    public DaytonaSandboxService(
            DaytonaProperties properties,
            ObjectProvider<Daytona> daytonaProvider,
            DaytonaPreviewTemplateService templateService,
            RestTemplate restTemplate
    ) {
        this.properties = properties;
        this.daytonaProvider = daytonaProvider;
        this.templateService = templateService;
        this.restTemplate = restTemplate;
    }

    public boolean isAvailable() {
        return properties.isConfigured() && daytonaProvider.getIfAvailable() != null;
    }

    public DaytonaDeployment deployPreview(
            Map<String, String> generatedFiles,
            String projectId,
            String messageId
    ) {
        if (!isAvailable()) {
            return null;
        }

        Daytona daytona = daytonaProvider.getObject();
        Sandbox sandbox;
        try {
            sandbox = createSandbox(daytona, projectId, messageId);
        } catch (Exception ex) {
            log.error("Daytona sandbox creation failed for message {}: {}", messageId, ex.getMessage(), ex);
            return null;
        }

        try {
            Map<String, String> projectFiles = templateService.buildProjectFiles(generatedFiles);
            String appDir = resolveAppDirectory(sandbox);
            uploadProjectFiles(sandbox, appDir, projectFiles);
            startDevServer(sandbox, appDir);
            String previewUrl = resolvePreviewUrl(sandbox.getId());

            return new DaytonaDeployment(
                    sandbox.getId(),
                    previewUrl,
                    projectFiles,
                    SandboxTemplateService.buildFragmentTitle(generatedFiles)
            );
        } catch (Exception ex) {
            log.error("Daytona preview deployment failed for message {}: {}", messageId, ex.getMessage(), ex);
            try {
                sandbox.delete();
            } catch (Exception deleteError) {
                log.warn("Failed to delete Daytona sandbox {} after deployment error", sandbox.getId(), deleteError);
            }
            return null;
        }
    }

    private Sandbox createSandbox(Daytona daytona, String projectId, String messageId) {
        Map<String, String> labels = new HashMap<>();
        labels.put("lovable-project-id", projectId);
        labels.put("lovable-message-id", messageId);

        if (properties.snapshot() != null && !properties.snapshot().isBlank()) {
            CreateSandboxFromSnapshotParams params = new CreateSandboxFromSnapshotParams();
            params.setSnapshot(properties.snapshot());
            params.setPublic(true);
            params.setLabels(labels);
            params.setAutoStopInterval(30);
            return daytona.create(params);
        }

        CreateSandboxFromImageParams params = new CreateSandboxFromImageParams();
        params.setImage("node:22-bookworm");
        params.setPublic(true);
        params.setLabels(labels);
        params.setAutoStopInterval(30);
        return daytona.create(params);
    }

    private String resolveAppDirectory(Sandbox sandbox) {
        String workDir = sandbox.getWorkDir();
        if (workDir == null || workDir.isBlank()) {
            workDir = sandbox.getUserHomeDir();
        }
        return workDir + "/lovable-app";
    }

    private void uploadProjectFiles(Sandbox sandbox, String appDir, Map<String, String> projectFiles) {
        sandbox.fs.createFolder(appDir, "755");
        sandbox.fs.createFolder(appDir + "/src", "755");

        for (Map.Entry<String, String> entry : projectFiles.entrySet()) {
            String remotePath = appDir + "/" + entry.getKey().replace("\\", "/");
            sandbox.fs.uploadFile(entry.getValue().getBytes(StandardCharsets.UTF_8), remotePath);
        }
    }

    private void startDevServer(Sandbox sandbox, String appDir) throws InterruptedException {
        String installCommand = "bash -lc 'cd \"%s\" && npm install'".formatted(appDir);
        ExecuteResponse installResponse = sandbox.process.executeCommand(
                installCommand,
                appDir,
                Map.of("CI", "true"),
                properties.commandTimeoutSeconds()
        );
        log.info(
                "Daytona npm install finished for sandbox {} with exit code {}",
                sandbox.getId(),
                installResponse.getExitCode()
        );

        String sessionId = "vite-dev-" + sandbox.getId();
        sandbox.process.createSession(sessionId);

        SessionExecuteRequest devRequest = new SessionExecuteRequest();
        devRequest.setCommand(
                "cd \"%s\" && npm run dev -- --host 0.0.0.0 --port %d".formatted(appDir, properties.previewPort())
        );
        devRequest.setRunAsync(true);
        sandbox.process.executeSessionCommand(sessionId, devRequest);

        log.info("Daytona dev server starting for sandbox {} on port {}", sandbox.getId(), properties.previewPort());
        Thread.sleep(15000L);
    }

    private String resolvePreviewUrl(String sandboxId) {
        String url = "%s/sandbox/%s/ports/%d/signed-preview-url?expiresInSeconds=%d".formatted(
                trimTrailingSlash(properties.apiUrl()),
                sandboxId,
                properties.previewPort(),
                properties.previewExpirySeconds()
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(properties.apiKey());
        HttpEntity<Void> request = new HttpEntity<>(headers);

        ResponseEntity<SignedPortPreviewUrl> response = restTemplate.exchange(
                url,
                HttpMethod.GET,
                request,
                SignedPortPreviewUrl.class
        );

        SignedPortPreviewUrl signedPreview = response.getBody();
        if (signedPreview == null || signedPreview.getUrl() == null || signedPreview.getUrl().isBlank()) {
            throw new IllegalStateException("Daytona returned an empty preview URL");
        }

        return signedPreview.getUrl();
    }

    private static String trimTrailingSlash(String apiUrl) {
        if (apiUrl == null || apiUrl.isBlank()) {
            return "https://app.daytona.io/api";
        }
        return apiUrl.endsWith("/") ? apiUrl.substring(0, apiUrl.length() - 1) : apiUrl;
    }

    public record DaytonaDeployment(
            String sandboxId,
            String previewUrl,
            Map<String, String> files,
            String title
    ) {
        public Map<String, String> filesOrEmpty() {
            return files == null ? Map.of() : new HashMap<>(files);
        }
    }
}

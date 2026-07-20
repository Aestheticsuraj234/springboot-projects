package me.surajkumarjha.lovable_backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import me.surajkumarjha.lovable_backend.dto.request.CreateFragmentRequest;
import me.surajkumarjha.lovable_backend.dto.response.FragmentResponse;
import me.surajkumarjha.lovable_backend.entity.Fragment;
import me.surajkumarjha.lovable_backend.entity.Message;
import me.surajkumarjha.lovable_backend.enums.MessageRole;
import me.surajkumarjha.lovable_backend.exception.ResourceNotFoundException;
import me.surajkumarjha.lovable_backend.repository.FragmentRepository;
import me.surajkumarjha.lovable_backend.repository.MessageRepository;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class FragmentService {

    private final FragmentRepository fragmentRepository;
    private final MessageRepository messageRepository;
    private final ProjectService projectService;
    private final CodeExtractionService codeExtractionService;
    private final DaytonaPreviewTemplateService daytonaPreviewTemplateService;
    private final ObjectMapper objectMapper;

    public FragmentService(
            FragmentRepository fragmentRepository,
            MessageRepository messageRepository,
            ProjectService projectService,
            CodeExtractionService codeExtractionService,
            DaytonaPreviewTemplateService daytonaPreviewTemplateService,
            @Qualifier("lovableObjectMapper") ObjectMapper objectMapper
    ) {
        this.fragmentRepository = fragmentRepository;
        this.messageRepository = messageRepository;
        this.projectService = projectService;
        this.codeExtractionService = codeExtractionService;
        this.daytonaPreviewTemplateService = daytonaPreviewTemplateService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public FragmentResponse getFragment(String projectId, String messageId) {
        projectService.verifyProjectOwnership(projectId);
        Message message = messageRepository.findByIdAndProjectId(messageId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        Fragment fragment = message.getFragment();
        if (fragment == null) {
            throw new ResourceNotFoundException("Fragment not found");
        }
        repairFragmentIfNeeded(message);
        return FragmentResponse.from(message.getFragment());
    }

    @Transactional
    public FragmentResponse createFragment(String projectId, String messageId, CreateFragmentRequest request) {
        projectService.verifyProjectOwnership(projectId);
        Message message = messageRepository.findByIdAndProjectId(messageId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        if (fragmentRepository.findByMessageId(messageId).isPresent()) {
            throw new IllegalArgumentException("Fragment already exists for this message");
        }

        Fragment fragment = Fragment.builder()
                .message(message)
                .sandboxUrl(request.sandboxUrl())
                .title(request.title())
                .files(objectMapper.valueToTree(request.files()))
                .build();

        return FragmentResponse.from(fragmentRepository.save(fragment));
    }

    @Transactional
    public void createFragmentForMessage(Message message, Map<String, String> files) {
        Message managedMessage = messageRepository.findById(message.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        createFragmentForMessage(
                managedMessage,
                files,
                "sandpack://preview/" + managedMessage.getProject().getId() + "/" + managedMessage.getId(),
                SandboxTemplateService.buildFragmentTitle(files)
        );
    }

    @Transactional
    public void createFragmentForMessage(
            Message message,
            Map<String, String> files,
            String sandboxUrl,
            String title
    ) {
        if (files == null || files.isEmpty()) {
            return;
        }

        if (fragmentRepository.findByMessageId(message.getId()).isPresent()) {
            return;
        }

        Message managedMessage = messageRepository.findById(message.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        JsonNode filesNode = objectMapper.valueToTree(files);
        Fragment fragment = Fragment.builder()
                .message(managedMessage)
                .sandboxUrl(sandboxUrl)
                .title(title)
                .files(filesNode)
                .build();

        fragmentRepository.save(fragment);
    }

    @Transactional
    public void repairFragmentIfNeeded(Message message) {
        if (message.getRole() != MessageRole.ASSISTANT || message.getFragment() == null) {
            return;
        }

        Map<String, String> currentFiles = toFilesMap(message.getFragment().getFiles());
        if (!looksCorrupted(currentFiles)) {
            return;
        }

        Map<String, String> extracted = codeExtractionService.extractFiles(message.getContent());
        if (extracted.isEmpty() || looksCorrupted(extracted)) {
            return;
        }

        Map<String, String> repairedFiles = message.getFragment().getSandboxUrl().startsWith("http")
                ? daytonaPreviewTemplateService.buildProjectFiles(extracted)
                : extracted;

        Fragment fragment = message.getFragment();
        fragment.setFiles(objectMapper.valueToTree(repairedFiles));
        fragmentRepository.save(fragment);
    }

    private static Map<String, String> toFilesMap(JsonNode files) {
        if (files == null || files.isNull() || !files.isObject()) {
            return Map.of();
        }

        Map<String, String> result = new LinkedHashMap<>();
        files.fields().forEachRemaining(entry -> {
            JsonNode value = entry.getValue();
            if (value != null && value.isTextual()) {
                result.put(entry.getKey(), value.asText());
            }
        });
        return result;
    }

    private static boolean looksCorrupted(Map<String, String> files) {
        if (files.isEmpty()) {
            return true;
        }

        for (Map.Entry<String, String> entry : files.entrySet()) {
            String path = entry.getKey();
            String content = entry.getValue();
            if (content == null || content.isBlank()) {
                return true;
            }
            if (content.contains("```")) {
                return true;
            }
            if (path.matches("(?i)(App\\.jsx|src/App\\.jsx)") && !content.contains("export default")) {
                return true;
            }
            if (content.contains("import './App.") && !content.contains("App.css")) {
                return true;
            }
        }

        return false;
    }
}

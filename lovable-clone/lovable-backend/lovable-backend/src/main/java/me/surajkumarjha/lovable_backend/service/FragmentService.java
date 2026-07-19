package me.surajkumarjha.lovable_backend.service;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.CreateFragmentRequest;
import me.surajkumarjha.lovable_backend.dto.response.FragmentResponse;
import me.surajkumarjha.lovable_backend.entity.Fragment;
import me.surajkumarjha.lovable_backend.entity.Message;
import me.surajkumarjha.lovable_backend.exception.ResourceNotFoundException;
import me.surajkumarjha.lovable_backend.repository.FragmentRepository;
import me.surajkumarjha.lovable_backend.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FragmentService {

    private final FragmentRepository fragmentRepository;
    private final MessageRepository messageRepository;
    private final ProjectService projectService;

    @Transactional(readOnly = true)
    public FragmentResponse getFragment(String projectId, String messageId) {
        projectService.verifyProjectOwnership(projectId);
        Message message = messageRepository.findByIdAndProjectId(messageId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));

        Fragment fragment = message.getFragment();
        if (fragment == null) {
            throw new ResourceNotFoundException("Fragment not found");
        }
        return FragmentResponse.from(fragment);
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
                .files(request.files())
                .build();

        return FragmentResponse.from(fragmentRepository.save(fragment));
    }
}

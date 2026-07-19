package me.surajkumarjha.lovable_backend.service;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.CreateMessageRequest;
import me.surajkumarjha.lovable_backend.dto.response.MessageResponse;
import me.surajkumarjha.lovable_backend.entity.Message;
import me.surajkumarjha.lovable_backend.entity.Project;
import me.surajkumarjha.lovable_backend.enums.MessageRole;
import me.surajkumarjha.lovable_backend.enums.MessageType;
import me.surajkumarjha.lovable_backend.exception.ResourceNotFoundException;
import me.surajkumarjha.lovable_backend.repository.MessageRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final ProjectService projectService;

    @Transactional(readOnly = true)
    public List<MessageResponse> listMessages(String projectId) {
        projectService.verifyProjectOwnership(projectId);
        return messageRepository.findByProjectIdOrderByCreatedAtAsc(projectId).stream()
                .map(MessageResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public MessageResponse getMessage(String projectId, String messageId) {
        projectService.verifyProjectOwnership(projectId);
        Message message = messageRepository.findByIdAndProjectId(messageId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        return MessageResponse.from(message);
    }

    @Transactional
    public MessageResponse createUserMessage(String projectId, CreateMessageRequest request) {
        Project project = projectService.getOwnedProject(projectId);
        Message message = Message.builder()
                .content(request.content())
                .role(MessageRole.USER)
                .type(MessageType.RESULT)
                .project(project)
                .build();
        return MessageResponse.from(messageRepository.save(message));
    }

    @Transactional
    public Message saveUserMessage(String projectId, String content) {
        Project project = projectService.getOwnedProject(projectId);
        return saveUserMessage(project, content);
    }

    @Transactional
    public Message saveUserMessage(Project project, String content) {
        Message message = Message.builder()
                .content(content)
                .role(MessageRole.USER)
                .type(MessageType.RESULT)
                .project(project)
                .build();
        return messageRepository.save(message);
    }

    @Transactional
    public Message saveAssistantMessage(String projectId, String content, MessageType type) {
        Project project = projectService.getOwnedProject(projectId);
        return saveAssistantMessage(project, content, type);
    }

    @Transactional
    public Message saveAssistantMessage(Project project, String content, MessageType type) {
        Message message = Message.builder()
                .content(content)
                .role(MessageRole.ASSISTANT)
                .type(type)
                .project(project)
                .build();
        return messageRepository.save(message);
    }
}

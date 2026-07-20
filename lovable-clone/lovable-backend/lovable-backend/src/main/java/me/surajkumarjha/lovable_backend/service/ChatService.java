package me.surajkumarjha.lovable_backend.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import me.surajkumarjha.lovable_backend.dto.request.ChatRequest;
import me.surajkumarjha.lovable_backend.entity.Project;
import me.surajkumarjha.lovable_backend.enums.MessageRole;
import me.surajkumarjha.lovable_backend.enums.MessageType;
import me.surajkumarjha.lovable_backend.repository.MessageRepository;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.messages.Message;
import org.springframework.ai.chat.messages.SystemMessage;
import org.springframework.ai.chat.messages.UserMessage;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private static final String SYSTEM_PROMPT = """
            You are a React code generator running inside a Daytona cloud sandbox preview.
            The user wants runnable app code, not tutorials.

            RULES:
            - Do NOT explain setup steps, npm commands, folder structures, or how to run the app.
            - Do NOT mention localhost, npm start, create-react-app, or opening files manually.
            - Respond with ONLY fenced code blocks — one block per file.
            - Every block header MUST include the filename.

            Required format:
            ```jsx App.jsx
            import React, { useState } from 'react';
            import './App.css';

            export default function App() {
              return <div className="App">...</div>;
            }
            ```

            ```css App.css
            .App { ... }
            ```

            Keep any prose outside code blocks to at most one short sentence.
            Always include App.jsx and its CSS file.
            """;

    private final ChatClient.Builder chatClientBuilder;
    private final ProjectService projectService;
    private final MessageService messageService;
    private final MessageRepository messageRepository;
    private final CodeExtractionService codeExtractionService;
    private final FragmentService fragmentService;
    private final DaytonaSandboxService daytonaSandboxService;

    public Flux<ServerSentEvent<String>> streamChat(String projectId, ChatRequest request) {
        Project project = projectService.getOwnedProject(projectId);
        messageService.saveUserMessage(project, request.content());

        StringBuilder assistantContent = new StringBuilder();
        List<me.surajkumarjha.lovable_backend.entity.Message> history =
                messageRepository.findByProjectIdOrderByCreatedAtAsc(projectId);

        List<Message> promptMessages = new ArrayList<>();
        promptMessages.add(new SystemMessage(SYSTEM_PROMPT));
        for (me.surajkumarjha.lovable_backend.entity.Message message : history) {
            if (message.getRole() == MessageRole.USER) {
                promptMessages.add(new UserMessage(message.getContent()));
            } else if (message.getRole() == MessageRole.ASSISTANT && message.getType() == MessageType.RESULT) {
                promptMessages.add(new AssistantMessage(message.getContent()));
            }
        }

        return chatClientBuilder.build()
                .prompt()
                .messages(promptMessages)
                .stream()
                .content()
                .map(chunk -> {
                    assistantContent.append(chunk);
                    return ServerSentEvent.builder(chunk).build();
                })
                .concatWith(Flux.defer(() -> {
                    try {
                        me.surajkumarjha.lovable_backend.entity.Message assistantMessage = messageService.saveAssistantMessage(
                                project,
                                assistantContent.toString(),
                                MessageType.RESULT
                        );
                        try {
                            createPreviewFragment(project, assistantMessage, assistantContent.toString());
                        } catch (Exception fragmentError) {
                            log.error("Preview fragment creation failed for project {}", project.getId(), fragmentError);
                        }
                    } catch (Exception saveError) {
                        log.error("Failed to save assistant message for project {}", project.getId(), saveError);
                    }
                    return Flux.just(ServerSentEvent.builder("[DONE]").event("done").build());
                }))
                .onErrorResume(error -> {
                    log.error("Chat stream failed for project {}", project.getId(), error);
                    try {
                        String errorMessage = error.getMessage() == null ? error.getClass().getSimpleName() : error.getMessage();
                        messageService.saveAssistantMessage(project, errorMessage, MessageType.ERROR);
                    } catch (Exception saveError) {
                        log.error("Failed to save chat error message for project {}", project.getId(), saveError);
                    }
                    return Flux.just(
                            ServerSentEvent.builder("[DONE]").event("done").build(),
                            ServerSentEvent.builder(
                                    error.getMessage() == null ? error.getClass().getSimpleName() : error.getMessage()
                            ).event("error").build()
                    );
                });
    }

    private void createPreviewFragment(
            Project project,
            me.surajkumarjha.lovable_backend.entity.Message assistantMessage,
            String content
    ) {
        Map<String, String> files = codeExtractionService.extractFiles(content);
        if (files.isEmpty()) {
            return;
        }

        DaytonaSandboxService.DaytonaDeployment deployment = daytonaSandboxService.deployPreview(
                files,
                project.getId(),
                assistantMessage.getId()
        );

        if (deployment != null) {
            fragmentService.createFragmentForMessage(
                    assistantMessage,
                    deployment.filesOrEmpty(),
                    deployment.previewUrl(),
                    deployment.title()
            );
            return;
        }

        fragmentService.createFragmentForMessage(assistantMessage, files);
    }
}

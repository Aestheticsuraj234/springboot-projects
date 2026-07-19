package me.surajkumarjha.lovable_backend.service;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.ChatRequest;
import me.surajkumarjha.lovable_backend.enums.MessageType;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClient.Builder chatClientBuilder;
    private final ProjectService projectService;
    private final MessageService messageService;

    public Flux<ServerSentEvent<String>> streamChat(String projectId, ChatRequest request) {
        projectService.getOwnedProject(projectId);
        messageService.saveUserMessage(projectId, request.content());

        StringBuilder assistantContent = new StringBuilder();

        return chatClientBuilder.build()
                .prompt()
                .user(request.content())
                .stream()
                .content()
                .map(chunk -> {
                    assistantContent.append(chunk);
                    return ServerSentEvent.builder(chunk).build();
                })
                .concatWith(Flux.defer(() -> {
                    messageService.saveAssistantMessage(
                            projectId,
                            assistantContent.toString(),
                            MessageType.RESULT
                    );
                    return Flux.just(ServerSentEvent.builder("[DONE]").event("done").build());
                }))
                .onErrorResume(error -> {
                    messageService.saveAssistantMessage(
                            projectId,
                            error.getMessage(),
                            MessageType.ERROR
                    );
                    return Flux.just(ServerSentEvent.builder(error.getMessage()).event("error").build());
                });
    }
}

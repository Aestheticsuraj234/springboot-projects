package me.surajkumarjha.lovable_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.ChatRequest;
import me.surajkumarjha.lovable_backend.service.ChatService;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("/api/projects/{projectId}/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping(produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChat(
            @PathVariable String projectId,
            @Valid @RequestBody ChatRequest request
    ) {
        return chatService.streamChat(projectId, request);
    }
}

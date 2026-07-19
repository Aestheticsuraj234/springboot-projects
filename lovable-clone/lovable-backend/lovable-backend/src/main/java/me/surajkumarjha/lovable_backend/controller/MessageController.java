package me.surajkumarjha.lovable_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.CreateMessageRequest;
import me.surajkumarjha.lovable_backend.dto.response.MessageResponse;
import me.surajkumarjha.lovable_backend.service.MessageService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/projects/{projectId}/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    @GetMapping
    public List<MessageResponse> listMessages(@PathVariable String projectId) {
        return messageService.listMessages(projectId);
    }

    @GetMapping("/{messageId}")
    public MessageResponse getMessage(
            @PathVariable String projectId,
            @PathVariable String messageId
    ) {
        return messageService.getMessage(projectId, messageId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse createMessage(
            @PathVariable String projectId,
            @Valid @RequestBody CreateMessageRequest request
    ) {
        return messageService.createUserMessage(projectId, request);
    }
}

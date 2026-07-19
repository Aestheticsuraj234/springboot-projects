package me.surajkumarjha.lovable_backend.dto.response;

import me.surajkumarjha.lovable_backend.entity.Message;
import me.surajkumarjha.lovable_backend.enums.MessageRole;
import me.surajkumarjha.lovable_backend.enums.MessageType;

import java.time.Instant;

public record MessageResponse(
        String id,
        String content,
        MessageRole role,
        MessageType type,
        String projectId,
        FragmentResponse fragment,
        Instant createdAt,
        Instant updatedAt
) {
    public static MessageResponse from(Message message) {
        FragmentResponse fragment = message.getFragment() == null
                ? null
                : FragmentResponse.from(message.getFragment());
        return new MessageResponse(
                message.getId(),
                message.getContent(),
                message.getRole(),
                message.getType(),
                message.getProjectId(),
                fragment,
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}

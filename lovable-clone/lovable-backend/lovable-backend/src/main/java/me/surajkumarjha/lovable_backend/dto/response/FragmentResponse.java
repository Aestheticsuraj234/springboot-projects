package me.surajkumarjha.lovable_backend.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import me.surajkumarjha.lovable_backend.entity.Fragment;

import java.time.Instant;

public record FragmentResponse(
        String id,
        String messageId,
        String sandboxUrl,
        String title,
        JsonNode files,
        Instant createdAt,
        Instant updatedAt
) {
    public static FragmentResponse from(Fragment fragment) {
        return new FragmentResponse(
                fragment.getId(),
                fragment.getMessageId(),
                fragment.getSandboxUrl(),
                fragment.getTitle(),
                fragment.getFiles(),
                fragment.getCreatedAt(),
                fragment.getUpdatedAt()
        );
    }
}

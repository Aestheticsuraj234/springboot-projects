package me.surajkumarjha.lovable_backend.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import me.surajkumarjha.lovable_backend.entity.Fragment;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

public record FragmentResponse(
        String id,
        String messageId,
        String sandboxUrl,
        String title,
        Map<String, String> files,
        Instant createdAt,
        Instant updatedAt
) {
    public static FragmentResponse from(Fragment fragment) {
        return new FragmentResponse(
                fragment.getId(),
                fragment.getMessageId(),
                fragment.getSandboxUrl(),
                fragment.getTitle(),
                toFilesMap(fragment.getFiles()),
                fragment.getCreatedAt(),
                fragment.getUpdatedAt()
        );
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
}

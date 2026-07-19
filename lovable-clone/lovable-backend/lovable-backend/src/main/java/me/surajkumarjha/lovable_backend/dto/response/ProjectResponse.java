package me.surajkumarjha.lovable_backend.dto.response;

import me.surajkumarjha.lovable_backend.entity.Project;

import java.time.Instant;

public record ProjectResponse(
        String id,
        String name,
        String userId,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProjectResponse from(Project project) {
        return new ProjectResponse(
                project.getId(),
                project.getName(),
                project.getUserId(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}

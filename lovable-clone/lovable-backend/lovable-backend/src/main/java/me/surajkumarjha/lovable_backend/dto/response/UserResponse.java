package me.surajkumarjha.lovable_backend.dto.response;

import me.surajkumarjha.lovable_backend.entity.User;

import java.time.Instant;

public record UserResponse(
        String id,
        String email,
        String name,
        String image,
        Instant createdAt,
        Instant updatedAt
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getImage(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}

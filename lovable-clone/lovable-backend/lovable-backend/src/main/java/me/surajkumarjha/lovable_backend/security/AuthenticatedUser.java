package me.surajkumarjha.lovable_backend.security;

public record AuthenticatedUser(
        String id,
        String email
) {
}

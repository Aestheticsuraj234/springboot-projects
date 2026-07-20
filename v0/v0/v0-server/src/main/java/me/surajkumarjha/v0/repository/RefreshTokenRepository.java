package me.surajkumarjha.v0.repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import me.surajkumarjha.v0.entity.RefreshToken;
import me.surajkumarjha.v0.entity.User;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {
    Optional<RefreshToken> findByTokenHash(String tokenHash);
    void deleteAllByUser(User user);
    void deleteAllByUserAndRevokedTrue(User user);
}
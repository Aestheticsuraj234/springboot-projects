package me.surajkumarjha.lovable_backend.repository;

import me.surajkumarjha.lovable_backend.entity.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.time.Instant;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, String> {

    Optional<RefreshToken> findByTokenHash(String tokenHash);

    @Modifying
    @Query("delete from RefreshToken rt where rt.user.id = :userId")
    void deleteAllByUserId(String userId);

    @Modifying
    @Query("delete from RefreshToken rt where rt.expiresAt < :now")
    void deleteExpiredTokens(Instant now);
}

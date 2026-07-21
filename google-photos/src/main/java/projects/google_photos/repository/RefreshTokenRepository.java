package projects.google_photos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.google_photos.domain.RefreshToken;

import java.util.Optional;
import java.util.UUID;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, UUID> {

    Optional<RefreshToken> findByToken(String token);

    void deleteByUserId(UUID userId);
}

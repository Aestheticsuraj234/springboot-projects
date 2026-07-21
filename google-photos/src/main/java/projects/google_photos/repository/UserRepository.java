package projects.google_photos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import projects.google_photos.domain.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}

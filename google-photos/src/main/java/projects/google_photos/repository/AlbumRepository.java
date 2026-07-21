package projects.google_photos.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import projects.google_photos.domain.Album;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AlbumRepository extends JpaRepository<Album, UUID> {

    List<Album> findByUserIdOrderByUpdatedAtDesc(UUID userId);

    Optional<Album> findByIdAndUserId(UUID id, UUID userId);

    @Query("""
            SELECT COUNT(ap) FROM AlbumPhoto ap
            WHERE ap.album.id = :albumId
            """)
    long countPhotosByAlbumId(@Param("albumId") UUID albumId);
}

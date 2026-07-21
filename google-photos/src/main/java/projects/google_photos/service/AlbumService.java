package projects.google_photos.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import projects.google_photos.domain.Album;
import projects.google_photos.domain.AlbumPhoto;
import projects.google_photos.domain.Photo;
import projects.google_photos.domain.PhotoStatus;
import projects.google_photos.domain.User;
import projects.google_photos.dto.AddPhotosToAlbumRequest;
import projects.google_photos.dto.AlbumResponse;
import projects.google_photos.dto.CreateAlbumRequest;
import projects.google_photos.dto.PageResponse;
import projects.google_photos.dto.PhotoResponse;
import projects.google_photos.dto.UpdateAlbumRequest;
import projects.google_photos.exception.BadRequestException;
import projects.google_photos.exception.ResourceNotFoundException;
import projects.google_photos.repository.AlbumPhotoRepository;
import projects.google_photos.repository.AlbumRepository;
import projects.google_photos.repository.PhotoRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
public class AlbumService {

    private final AlbumRepository albumRepository;
    private final AlbumPhotoRepository albumPhotoRepository;
    private final PhotoRepository photoRepository;
    private final PhotoService photoService;

    public AlbumService(
            AlbumRepository albumRepository,
            AlbumPhotoRepository albumPhotoRepository,
            PhotoRepository photoRepository,
            PhotoService photoService
    ) {
        this.albumRepository = albumRepository;
        this.albumPhotoRepository = albumPhotoRepository;
        this.photoRepository = photoRepository;
        this.photoService = photoService;
    }

    @Transactional(readOnly = true)
    public List<AlbumResponse> listAlbums(User user) {
        return albumRepository.findByUserIdOrderByUpdatedAtDesc(user.getId()).stream()
                .map(album -> toAlbumResponse(album, albumRepository.countPhotosByAlbumId(album.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public AlbumResponse getAlbum(User user, UUID albumId) {
        Album album = getOwnedAlbum(user, albumId);
        return toAlbumResponse(album, albumRepository.countPhotosByAlbumId(album.getId()));
    }

    @Transactional(readOnly = true)
    public PageResponse<PhotoResponse> getAlbumPhotos(User user, UUID albumId, Pageable pageable) {
        getOwnedAlbum(user, albumId);
        Page<AlbumPhoto> page = albumPhotoRepository.findByAlbumIdAndUserId(albumId, user.getId(), pageable);
        List<PhotoResponse> photos = page.getContent().stream()
                .map(AlbumPhoto::getPhoto)
                .map(photoService::toPhotoResponse)
                .toList();

        return new PageResponse<>(
                photos,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional
    public AlbumResponse createAlbum(User user, CreateAlbumRequest request) {
        Album album = Album.builder()
                .user(user)
                .title(request.title().trim())
                .build();
        return toAlbumResponse(albumRepository.save(album), 0);
    }

    @Transactional
    public AlbumResponse updateAlbum(User user, UUID albumId, UpdateAlbumRequest request) {
        Album album = getOwnedAlbum(user, albumId);

        if (request.title() != null && !request.title().isBlank()) {
            album.setTitle(request.title().trim());
        }

        if (request.coverPhotoId() != null) {
            Photo coverPhoto = photoRepository.findByIdAndUserId(request.coverPhotoId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cover photo not found"));
            if (coverPhoto.getStatus() != PhotoStatus.ACTIVE) {
                throw new BadRequestException("Cover photo must be active");
            }
            album.setCoverPhoto(coverPhoto);
        }

        return toAlbumResponse(
                albumRepository.save(album),
                albumRepository.countPhotosByAlbumId(album.getId())
        );
    }

    @Transactional
    public void deleteAlbum(User user, UUID albumId) {
        Album album = getOwnedAlbum(user, albumId);
        albumRepository.delete(album);
    }

    @Transactional
    public void addPhotosToAlbum(User user, UUID albumId, AddPhotosToAlbumRequest request) {
        Album album = getOwnedAlbum(user, albumId);
        List<Photo> photos = photoRepository.findByIdInAndUserId(request.photoIds(), user.getId());

        if (photos.size() != request.photoIds().size()) {
            throw new ResourceNotFoundException("One or more photos were not found");
        }

        int sortOrder = albumPhotoRepository.findMaxSortOrder(albumId);
        List<AlbumPhoto> albumPhotos = new ArrayList<>();

        for (Photo photo : photos) {
            if (photo.getStatus() != PhotoStatus.ACTIVE) {
                throw new BadRequestException("Only active photos can be added to albums");
            }
            if (albumPhotoRepository.existsByAlbumIdAndPhotoId(albumId, photo.getId())) {
                continue;
            }
            sortOrder++;
            albumPhotos.add(AlbumPhoto.builder()
                    .album(album)
                    .photo(photo)
                    .sortOrder(sortOrder)
                    .build());
        }

        albumPhotoRepository.saveAll(albumPhotos);

        if (album.getCoverPhoto() == null && !photos.isEmpty()) {
            album.setCoverPhoto(photos.get(0));
            albumRepository.save(album);
        }
    }

    @Transactional
    public void removePhotoFromAlbum(User user, UUID albumId, UUID photoId) {
        getOwnedAlbum(user, albumId);
        if (!albumPhotoRepository.existsByAlbumIdAndPhotoId(albumId, photoId)) {
            throw new ResourceNotFoundException("Photo not found in album");
        }
        albumPhotoRepository.deleteByAlbumIdAndPhotoId(albumId, photoId);
    }

    private Album getOwnedAlbum(User user, UUID albumId) {
        return albumRepository.findByIdAndUserId(albumId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Album not found"));
    }

    private AlbumResponse toAlbumResponse(Album album, long photoCount) {
        Photo coverPhoto = album.getCoverPhoto();
        return new AlbumResponse(
                album.getId(),
                album.getTitle(),
                coverPhoto != null ? coverPhoto.getId() : null,
                coverPhoto != null ? coverPhoto.getThumbnailUrl() : null,
                photoCount,
                album.getCreatedAt(),
                album.getUpdatedAt()
        );
    }
}

package projects.google_photos.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import projects.google_photos.domain.User;
import projects.google_photos.dto.UserResponse;
import projects.google_photos.exception.UnauthorizedException;
import projects.google_photos.repository.UserRepository;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getUserResponseByEmail(String email) {
        return toUserResponse(getByEmail(email));
    }

    public User getByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    public Optional<String> findEmailById(UUID userId) {
        return userRepository.findById(userId).map(User::getEmail);
    }

    public boolean existsById(UUID userId) {
        return userRepository.existsById(userId);
    }

    public UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getDisplayName());
    }
}

package me.surajkumarjha.lovable_backend.service;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.response.UserResponse;
import me.surajkumarjha.lovable_backend.entity.User;
import me.surajkumarjha.lovable_backend.exception.ResourceNotFoundException;
import me.surajkumarjha.lovable_backend.repository.UserRepository;
import me.surajkumarjha.lovable_backend.security.AuthenticatedUser;
import me.surajkumarjha.lovable_backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponse getCurrentUser() {
        AuthenticatedUser currentUser = SecurityUtils.requireCurrentUser();
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return UserResponse.from(user);
    }
}

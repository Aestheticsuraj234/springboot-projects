package me.surajkumarjha.v0.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.v0.config.JwtProperties;
import me.surajkumarjha.v0.dto.request.LoginRequest;
import me.surajkumarjha.v0.dto.request.RegisterRequest;
import me.surajkumarjha.v0.dto.response.AuthResponse;
import me.surajkumarjha.v0.entity.User;
import me.surajkumarjha.v0.exceptions.ApiException;
import me.surajkumarjha.v0.repository.UserRepository;
import me.surajkumarjha.v0.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ApiException(HttpStatus.CONFLICT, "Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ApiException(HttpStatus.CONFLICT, "Username is already taken");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        return buildAuthResponse(user.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        String email = authentication.getName();
        return buildAuthResponse(email);
    }

    private AuthResponse buildAuthResponse(String email) {
        String accessToken = jwtService.generateAccessToken(email);
        return AuthResponse.builder()
                .accessToken(accessToken)
                .expiresIn(jwtProperties.getAccessTokenExpiration() / 1000)
                .build();
    }
}

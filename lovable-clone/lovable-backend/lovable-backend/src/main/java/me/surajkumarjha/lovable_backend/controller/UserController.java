package me.surajkumarjha.lovable_backend.controller;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.response.UserResponse;
import me.surajkumarjha.lovable_backend.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public UserResponse getCurrentUser() {
        return userService.getCurrentUser();
    }
}

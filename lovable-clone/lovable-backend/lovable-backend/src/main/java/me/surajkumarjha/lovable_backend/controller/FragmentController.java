package me.surajkumarjha.lovable_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.CreateFragmentRequest;
import me.surajkumarjha.lovable_backend.dto.response.FragmentResponse;
import me.surajkumarjha.lovable_backend.service.FragmentService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/projects/{projectId}/messages/{messageId}/fragment")
@RequiredArgsConstructor
public class FragmentController {

    private final FragmentService fragmentService;

    @GetMapping
    public FragmentResponse getFragment(
            @PathVariable String projectId,
            @PathVariable String messageId
    ) {
        return fragmentService.getFragment(projectId, messageId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public FragmentResponse createFragment(
            @PathVariable String projectId,
            @PathVariable String messageId,
            @Valid @RequestBody CreateFragmentRequest request
    ) {
        return fragmentService.createFragment(projectId, messageId, request);
    }
}

package me.surajkumarjha.lovable_backend.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.UpsertUsageRequest;
import me.surajkumarjha.lovable_backend.dto.response.UsageResponse;
import me.surajkumarjha.lovable_backend.service.UsageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usage")
@RequiredArgsConstructor
public class UsageController {

    private final UsageService usageService;

    @GetMapping("/{key}")
    public UsageResponse getUsage(@PathVariable String key) {
        return usageService.getUsage(key);
    }

    @PutMapping
    public UsageResponse upsertUsage(@Valid @RequestBody UpsertUsageRequest request) {
        return usageService.upsertUsage(request);
    }
}

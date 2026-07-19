package me.surajkumarjha.lovable_backend.controller;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.response.DashboardResponse;
import me.surajkumarjha.lovable_backend.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    public DashboardResponse getDashboard() {
        return dashboardService.getDashboard();
    }
}

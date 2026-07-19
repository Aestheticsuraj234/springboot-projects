package me.surajkumarjha.lovable_backend.service;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.response.DashboardResponse;
import me.surajkumarjha.lovable_backend.entity.Project;
import me.surajkumarjha.lovable_backend.repository.ProjectRepository;
import me.surajkumarjha.lovable_backend.security.AuthenticatedUser;
import me.surajkumarjha.lovable_backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard() {
        AuthenticatedUser currentUser = SecurityUtils.requireCurrentUser();
        List<Project> projects = projectRepository.findByUserIdOrderByUpdatedAtDesc(currentUser.id());
        return DashboardResponse.from(projects);
    }
}

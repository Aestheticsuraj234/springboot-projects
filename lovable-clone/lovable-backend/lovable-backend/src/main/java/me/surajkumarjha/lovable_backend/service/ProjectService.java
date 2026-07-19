package me.surajkumarjha.lovable_backend.service;

import lombok.RequiredArgsConstructor;
import me.surajkumarjha.lovable_backend.dto.request.CreateProjectRequest;
import me.surajkumarjha.lovable_backend.dto.request.UpdateProjectRequest;
import me.surajkumarjha.lovable_backend.dto.response.ProjectResponse;
import me.surajkumarjha.lovable_backend.entity.Project;
import me.surajkumarjha.lovable_backend.entity.User;
import me.surajkumarjha.lovable_backend.exception.ForbiddenException;
import me.surajkumarjha.lovable_backend.exception.ResourceNotFoundException;
import me.surajkumarjha.lovable_backend.repository.ProjectRepository;
import me.surajkumarjha.lovable_backend.repository.UserRepository;
import me.surajkumarjha.lovable_backend.security.AuthenticatedUser;
import me.surajkumarjha.lovable_backend.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ProjectResponse> listProjects() {
        AuthenticatedUser currentUser = SecurityUtils.requireCurrentUser();
        return projectRepository.findByUserIdOrderByUpdatedAtDesc(currentUser.id()).stream()
                .map(ProjectResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getProject(String projectId) {
        Project project = getOwnedProject(projectId);
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse createProject(CreateProjectRequest request) {
        AuthenticatedUser currentUser = SecurityUtils.requireCurrentUser();
        User user = userRepository.findById(currentUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Project project = Project.builder()
                .name(request.name())
                .user(user)
                .build();

        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public ProjectResponse updateProject(String projectId, UpdateProjectRequest request) {
        Project project = getOwnedProject(projectId);
        project.setName(request.name());
        return ProjectResponse.from(projectRepository.save(project));
    }

    @Transactional
    public void deleteProject(String projectId) {
        Project project = getOwnedProject(projectId);
        projectRepository.delete(project);
    }

    Project getOwnedProject(String projectId) {
        AuthenticatedUser currentUser = SecurityUtils.requireCurrentUser();
        return projectRepository.findByIdAndUserId(projectId, currentUser.id())
                .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
    }

    void verifyProjectOwnership(String projectId) {
        AuthenticatedUser currentUser = SecurityUtils.requireCurrentUser();
        if (!projectRepository.existsByIdAndUserId(projectId, currentUser.id())) {
            throw new ForbiddenException("You do not have access to this project");
        }
    }
}

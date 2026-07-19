package me.surajkumarjha.lovable_backend.dto.response;

import me.surajkumarjha.lovable_backend.entity.Project;

import java.util.List;

public record DashboardResponse(
        List<ProjectResponse> projects,
        int projectCount
) {
    public static DashboardResponse from(List<Project> projects) {
        List<ProjectResponse> projectResponses = projects.stream()
                .map(ProjectResponse::from)
                .toList();
        return new DashboardResponse(projectResponses, projectResponses.size());
    }
}

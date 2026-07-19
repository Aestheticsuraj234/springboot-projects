package me.surajkumarjha.lovable_backend.repository;

import me.surajkumarjha.lovable_backend.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<Project, String> {

    List<Project> findByUserIdOrderByUpdatedAtDesc(String userId);

    Optional<Project> findByIdAndUserId(String id, String userId);

    boolean existsByIdAndUserId(String id, String userId);
}

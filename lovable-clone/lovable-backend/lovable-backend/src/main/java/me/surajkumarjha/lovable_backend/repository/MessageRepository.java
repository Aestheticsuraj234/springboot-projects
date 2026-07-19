package me.surajkumarjha.lovable_backend.repository;

import me.surajkumarjha.lovable_backend.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MessageRepository extends JpaRepository<Message, String> {

    List<Message> findByProjectIdOrderByCreatedAtAsc(String projectId);

    Optional<Message> findByIdAndProjectId(String id, String projectId);
}

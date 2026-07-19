package me.surajkumarjha.lovable_backend.repository;

import me.surajkumarjha.lovable_backend.entity.Usage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsageRepository extends JpaRepository<Usage, String> {
}

package me.surajkumarjha.lovable_backend.repository;

import me.surajkumarjha.lovable_backend.entity.Fragment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FragmentRepository extends JpaRepository<Fragment, String> {

    Optional<Fragment> findByMessageId(String messageId);
}

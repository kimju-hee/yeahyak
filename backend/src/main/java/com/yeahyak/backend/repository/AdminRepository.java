package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Admin;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {

  boolean existsByUser_UserId(Long userId);

  Optional<Admin> findByUser_UserId(Long userId);
}

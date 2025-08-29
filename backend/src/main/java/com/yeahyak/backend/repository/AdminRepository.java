package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Admin;
import com.yeahyak.backend.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<Admin, Long> {

  boolean existsByUser(User user);

  Optional<Admin> findByUser(User user);
}

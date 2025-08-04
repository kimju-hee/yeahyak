package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Admin;
import com.yeahyak.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {
    Optional<Admin> findByUser(User user);
}
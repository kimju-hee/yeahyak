package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Announcement;
import com.yeahyak.backend.entity.enums.AnnouncementType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    Page<Announcement> findByType(AnnouncementType type, Pageable pageable);}

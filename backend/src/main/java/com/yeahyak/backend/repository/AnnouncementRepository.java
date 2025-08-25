package com.yeahyak.backend.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.yeahyak.backend.entity.Announcement;
import com.yeahyak.backend.entity.enums.AnnouncementType;

public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {
    Page<Announcement> findByType(AnnouncementType type, Pageable pageable);

    Page<Announcement> findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
            String titleKeyword, String contentKeyword, Pageable pageable
    );

    Page<Announcement> findByTypeAndTitleContainingIgnoreCaseOrTypeAndContentContainingIgnoreCase(
            AnnouncementType type1, String titleKeyword, AnnouncementType type2, String contentKeyword, Pageable pageable
    );
}
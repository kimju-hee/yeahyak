package com.yeahyak.backend.service;

import com.yeahyak.backend.entity.Announcement;
import com.yeahyak.backend.repository.AnnouncementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public Announcement create(String type, String title, String content) {
        Announcement announcement = Announcement.builder()
                .type(type)
                .title(title)
                .content(content)
                .createdAt(LocalDateTime.now())
                .build();
        return announcementRepository.save(announcement);
    }

    public List<Announcement> findAll() {
        return announcementRepository.findAll();
    }

    public Announcement findById(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 공지사항이 없습니다."));
    }

    public void delete(Long id) {
        announcementRepository.deleteById(id);
    }
}

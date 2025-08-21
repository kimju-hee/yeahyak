package com.yeahyak.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.yeahyak.backend.entity.Announcement;
import com.yeahyak.backend.entity.enums.AnnouncementType;
import com.yeahyak.backend.repository.AnnouncementRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;

    public Announcement create(AnnouncementType type, String title, String content) {
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

    public Page<Announcement> findAllPaged(int page, int size, String type) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        if (type != null && !type.isEmpty()) {
            AnnouncementType enumType = AnnouncementType.valueOf(type.toUpperCase());
            return announcementRepository.findByType(enumType, pageable);
        } else {
            return announcementRepository.findAll(pageable);
        }
    }

    public Announcement findById(Long id) {
        return announcementRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("해당 ID의 공지사항이 없습니다."));
    }

    public void delete(Long id) {
        announcementRepository.deleteById(id);
    }

    public Announcement save(Announcement announcement) {
        return announcementRepository.save(announcement);
    }

    public Announcement update(Long id, Announcement updated) {
        Announcement original = findById(id);
        original.setType(updated.getType());
        original.setTitle(updated.getTitle());
        original.setContent(updated.getContent());
        original.setAttachmentUrl(updated.getAttachmentUrl());
        original.setUpdatedAt(LocalDateTime.now());
        return announcementRepository.save(original);
    }

    public Page<Announcement> searchAnnouncements(String keyword, Pageable pageable) {
        return announcementRepository.findByTitleContainingIgnoreCaseOrContentContainingIgnoreCase(
                keyword, keyword, pageable
        );
    }

    public Page<Announcement> searchAnnouncementsWithType(String type, String keyword, Pageable pageable) {
        AnnouncementType enumType = AnnouncementType.valueOf(type.toUpperCase());
        return announcementRepository.findByTypeAndTitleContainingIgnoreCaseOrTypeAndContentContainingIgnoreCase(
                enumType, keyword, enumType, keyword, pageable
        );
    }

    public String storeFile(MultipartFile file) {
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();


        Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(uploadPath);
            Path target = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("파일 저장 실패", e);
        }

        return "/uploads/" + fileName;
    }
}

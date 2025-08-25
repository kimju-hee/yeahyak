package com.yeahyak.backend.controller;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yeahyak.backend.dto.AnnouncementRequestDTO;
import com.yeahyak.backend.dto.JinhoResponse;
import com.yeahyak.backend.entity.Announcement;
import com.yeahyak.backend.service.AnnouncementService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping(consumes = {"multipart/form-data"})
    public JinhoResponse<Announcement> create(
            @RequestParam("announcement") String announcementJson,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        AnnouncementRequestDTO dto = mapper.readValue(announcementJson, AnnouncementRequestDTO.class);

        String fileUrl = null;
        if (file != null && !file.isEmpty()) {
            fileUrl = announcementService.storeFile(file);
        }

        Announcement announcement = Announcement.builder()
                .type(dto.getType())
                .title(dto.getTitle())
                .content(dto.getContent())
                .attachmentUrl(fileUrl)
                .createdAt(LocalDateTime.now())
                .build();

        Announcement saved = announcementService.save(announcement);
        return JinhoResponse.<Announcement>builder()
                .success(true)
                .data(List.of(saved))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }



    @GetMapping
    public JinhoResponse<Announcement> getAll(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String keyword
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));


        Page<Announcement> pagedResult;
        if (keyword != null && !keyword.isEmpty() && type != null && !type.isEmpty()) {
            pagedResult = announcementService.searchAnnouncementsWithType(type, keyword, pageable);
        } else if (keyword != null && !keyword.isEmpty()) {
            pagedResult = announcementService.searchAnnouncements(keyword, pageable);
        } else {
            pagedResult = announcementService.findAllPaged(page, size, type);
        }

        return JinhoResponse.<Announcement>builder()
                .success(true)
                .data(pagedResult.getContent())
                .totalPages(pagedResult.getTotalPages())
                .totalElements(pagedResult.getTotalElements())
                .currentPage(pagedResult.getNumber())
                .build();
    }



    @GetMapping("/{id}")
    public JinhoResponse<Announcement> getOne(@PathVariable Long id) {
        Announcement result = announcementService.findById(id);
        return JinhoResponse.<Announcement>builder()
                .success(true)
                .data(List.of(result))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }

    @PutMapping("/{id}")
    public JinhoResponse<Announcement> update(@PathVariable Long id, @RequestBody AnnouncementRequestDTO dto) {
        Announcement announcement = Announcement.builder()
                .announcementId(id)
                .type(dto.getType())
                .title(dto.getTitle())
                .content(dto.getContent())
                .updatedAt(LocalDateTime.now())
                .build();

        Announcement updated = announcementService.update(id, announcement);
        return JinhoResponse.<Announcement>builder()
                .success(true)
                .data(List.of(updated))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }

    @PatchMapping("/{id}")
    public JinhoResponse<Announcement> patch(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Announcement announcement = announcementService.findById(id);
        if (fields.containsKey("title")) {
            announcement.setTitle((String) fields.get("title"));
        }
        if (fields.containsKey("content")) {
            announcement.setContent((String) fields.get("content"));
        }
        if (fields.containsKey("attachmentUrl")) {
            announcement.setAttachmentUrl((String) fields.get("attachmentUrl"));
        }
        announcement.setUpdatedAt(LocalDateTime.now());

        Announcement saved = announcementService.save(announcement);
        return JinhoResponse.<Announcement>builder()
                .success(true)
                .data(List.of(saved))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }

    @DeleteMapping("/{id}")
    public JinhoResponse<String> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return JinhoResponse.<String>builder()
                .success(true)
                .data(List.of("삭제되었습니다."))
                .totalPages(1)
                .totalElements(1)
                .currentPage(0)
                .build();
    }
}
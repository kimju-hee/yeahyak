package com.yeahyak.backend.controller;

import com.yeahyak.backend.entity.Announcement;
import com.yeahyak.backend.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import com.yeahyak.backend.dto.ApiResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public ApiResponse<Announcement> create(@RequestBody Announcement announcement) {
        announcement.setCreatedAt(LocalDateTime.now());
        return new ApiResponse<>(true, announcementService.save(announcement));
    }

    @GetMapping
    public ApiResponse<List<Announcement>> getAll() {
        return new ApiResponse<>(true,announcementService.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<Announcement> getOne(@PathVariable Long id) {
        return new ApiResponse<>(true, announcementService.findById(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<Announcement> update(@PathVariable Long id,
                               @RequestBody Announcement updated) {
        return new ApiResponse<>(true, announcementService.update(id, updated));
    }

    @PatchMapping("/{id}")
    public ApiResponse<Announcement> patch(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Announcement announcement = announcementService.findById(id);

        if (fields.containsKey("title")) {
            announcement.setTitle((String) fields.get("title"));
        }
        if (fields.containsKey("content")) {
            announcement.setContent((String) fields.get("content"));
        }
        announcement.setUpdatedAt(LocalDateTime.now());

        return new ApiResponse<>(true, announcementService.save(announcement));
    }


    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        announcementService.delete(id);
        return new ApiResponse<>(true, "삭제되었습니다.");
    }
}

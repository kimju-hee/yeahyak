package com.yeahyak.backend.controller;

import com.yeahyak.backend.entity.Announcement;
import com.yeahyak.backend.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public Announcement create(@RequestBody Announcement announcement) {
        announcement.setCreatedAt(LocalDateTime.now());
        return announcementService.save(announcement);
    }

    @GetMapping
    public List<Announcement> getAll() {
        return announcementService.findAll();
    }

    @GetMapping("/{id}")
    public Announcement getOne(@PathVariable Long id) {
        return announcementService.findById(id);
    }

    @PutMapping("/{id}")
    public Announcement update(@PathVariable Long id,
                               @RequestBody Announcement updated) {
        return announcementService.update(id, updated);
    }

    @PatchMapping("/{id}")
    public Announcement patch(@PathVariable Long id, @RequestBody Map<String, Object> fields) {
        Announcement announcement = announcementService.findById(id);

        if (fields.containsKey("title")) {
            announcement.setTitle((String) fields.get("title"));
        }
        if (fields.containsKey("content")) {
            announcement.setContent((String) fields.get("content"));
        }
        announcement.setUpdatedAt(LocalDateTime.now());

        return announcementService.save(announcement);
    }


    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        announcementService.delete(id);
    }
}

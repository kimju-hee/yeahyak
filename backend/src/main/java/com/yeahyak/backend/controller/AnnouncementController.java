package com.yeahyak.backend.controller;

import com.yeahyak.backend.entity.Announcement;
import com.yeahyak.backend.service.AnnouncementService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;

    @PostMapping
    public Announcement create(@RequestParam String type,
                               @RequestParam String title,
                               @RequestParam String content) {
        return announcementService.create(type, title, content);
    }

    @GetMapping
    public List<Announcement> getAll() {
        return announcementService.findAll();
    }

    @GetMapping("/{id}")
    public Announcement getOne(@PathVariable Long id) {
        return announcementService.findById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        announcementService.delete(id);
    }
}

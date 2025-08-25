package com.yeahyak.backend.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.yeahyak.backend.deprecated.JinhoResponse;
import com.yeahyak.backend.dto.NoticeCreateRequest;
import com.yeahyak.backend.entity.Notice;
import com.yeahyak.backend.service.NoticeService;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
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

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

  private final NoticeService noticeService;

  @PostMapping(consumes = {"multipart/form-data"})
  public JinhoResponse<Notice> create(
      @RequestParam("announcement") String announcementJson,
      @RequestPart(value = "file", required = false) MultipartFile file
  ) throws JsonProcessingException {
    ObjectMapper mapper = new ObjectMapper();
    NoticeCreateRequest dto = mapper.readValue(announcementJson, NoticeCreateRequest.class);

    String fileUrl = null;
    if (file != null && !file.isEmpty()) {
      fileUrl = noticeService.storeFile(file);
    }

    Notice notice = Notice.builder()
        .type(dto.getType())
        .title(dto.getTitle())
        .content(dto.getContent())
        .attachmentUrl(fileUrl)
        .createdAt(LocalDateTime.now())
        .build();

    Notice saved = noticeService.save(notice);
    return JinhoResponse.<Notice>builder()
        .success(true)
        .data(List.of(saved))
        .totalPages(1)
        .totalElements(1)
        .currentPage(0)
        .build();
  }


  @GetMapping
  public JinhoResponse<Notice> getAll(
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String keyword
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

    Page<Notice> pagedResult;
    if (keyword != null && !keyword.isEmpty() && type != null && !type.isEmpty()) {
      pagedResult = noticeService.searchAnnouncementsWithType(type, keyword, pageable);
    } else if (keyword != null && !keyword.isEmpty()) {
      pagedResult = noticeService.searchAnnouncements(keyword, pageable);
    } else {
      pagedResult = noticeService.searchNoticesByContent(page, size, type);
    }

    return JinhoResponse.<Notice>builder()
        .success(true)
        .data(pagedResult.getContent())
        .totalPages(pagedResult.getTotalPages())
        .totalElements(pagedResult.getTotalElements())
        .currentPage(pagedResult.getNumber())
        .build();
  }


  @GetMapping("/{id}")
  public JinhoResponse<Notice> getOne(@PathVariable Long id) {
    Notice result = noticeService.findById(id);
    return JinhoResponse.<Notice>builder()
        .success(true)
        .data(List.of(result))
        .totalPages(1)
        .totalElements(1)
        .currentPage(0)
        .build();
  }

  @PutMapping("/{id}")
  public JinhoResponse<Notice> update(@PathVariable Long id,
      @RequestBody NoticeCreateRequest dto) {
    Notice notice = Notice.builder()
        .announcementId(id)
        .type(dto.getType())
        .title(dto.getTitle())
        .content(dto.getContent())
        .updatedAt(LocalDateTime.now())
        .build();

    Notice updated = noticeService.update(notice);
    return JinhoResponse.<Notice>builder()
        .success(true)
        .data(List.of(updated))
        .totalPages(1)
        .totalElements(1)
        .currentPage(0)
        .build();
  }

  @PatchMapping("/{id}")
  public JinhoResponse<Notice> patch(@PathVariable Long id,
      @RequestBody Map<String, Object> fields) {
    Notice notice = noticeService.findById(id);
    if (fields.containsKey("title")) {
      notice.setTitle((String) fields.get("title"));
    }
    if (fields.containsKey("content")) {
      notice.setContent((String) fields.get("content"));
    }
    if (fields.containsKey("attachmentUrl")) {
      notice.setAttachmentUrl((String) fields.get("attachmentUrl"));
    }
    notice.setUpdatedAt(LocalDateTime.now());

    Notice saved = noticeService.save(notice);
    return JinhoResponse.<Notice>builder()
        .success(true)
        .data(List.of(saved))
        .totalPages(1)
        .totalElements(1)
        .currentPage(0)
        .build();
  }

  @DeleteMapping("/{id}")
  public JinhoResponse<String> delete(@PathVariable Long id) {
    noticeService.deleteNotice(id);
    return JinhoResponse.<String>builder()
        .success(true)
        .data(List.of("삭제되었습니다."))
        .totalPages(1)
        .totalElements(1)
        .currentPage(0)
        .build();
  }
}

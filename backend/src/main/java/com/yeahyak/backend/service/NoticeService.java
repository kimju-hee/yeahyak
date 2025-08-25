package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.NoticeCreateRequest;
import com.yeahyak.backend.dto.NoticeCreateResponse;
import com.yeahyak.backend.dto.NoticeDetailResponse;
import com.yeahyak.backend.dto.NoticeListResponse;
import com.yeahyak.backend.dto.NoticeUpdateRequest;
import com.yeahyak.backend.entity.Notice;
import com.yeahyak.backend.entity.enums.NoticeType;
import com.yeahyak.backend.repository.NoticeRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class NoticeService {

  private final NoticeRepository noticeRepo;

  @Transactional
  public NoticeCreateResponse createNotice(NoticeCreateRequest req, @Nullable MultipartFile file) {
    String attachmentUrl = null;
    if (file != null && !file.isEmpty()) {
      validateFile(file);
      attachmentUrl = storeFile(file);
    }
    Notice notice = Notice.builder()
        .type(req.getType())
        .title(req.getTitle())
        .content(req.getContent())
        .attachmentUrl(attachmentUrl)
        .build();
    noticeRepo.save(notice);
    return new NoticeCreateResponse(notice.getNoticeId());
  }

  private void validateFile(MultipartFile file) {
    String contentType = file.getContentType();
    String original = file.getOriginalFilename();
    String safeName = (original == null) ? "" : Paths.get(original).getFileName().toString();

    boolean mimeOk = contentType != null
        && (contentType.equals("application/pdf") || contentType.equals("text/plain"));
    boolean extOk = safeName.endsWith(".pdf") || safeName.endsWith(".txt");

    if (!mimeOk || !extOk) {
      throw new RuntimeException("허용되지 않는 파일 형식입니다.");
    }
  }

  public String storeFile(MultipartFile file) {
    String original = file.getOriginalFilename();
    String safeName = (original == null) ? "" : Paths.get(original).getFileName().toString();
    String fileName = UUID.randomUUID() + "_" + safeName;
    Path uploadPath = Paths.get("uploads").toAbsolutePath().normalize();
    try {
      Files.createDirectories(uploadPath);
      Path target = uploadPath.resolve(fileName).normalize();
      Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
    } catch (IOException e) {
      throw new RuntimeException("파일 저장에 실패했습니다.", e);
    }
    return "/uploads/" + fileName;
  }

  @Transactional(readOnly = true)
  public Page<NoticeListResponse> getNoticesByType(NoticeType type, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return noticeRepo.findByType(type, pageable)
        .map(notice -> NoticeListResponse.builder()
            .noticeId(notice.getNoticeId())
            .type(notice.getType())
            .title(notice.getTitle())
            .createdAt(notice.getCreatedAt())
            .build());
  }

  @Transactional(readOnly = true)
  public Page<NoticeListResponse> searchNoticesByTitle(
      NoticeType type, String keyword, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return noticeRepo.findByTypeAndTitleContainingIgnoreCase(type, keyword, pageable)
        .map(notice -> NoticeListResponse.builder()
            .noticeId(notice.getNoticeId())
            .type(notice.getType())
            .title(notice.getTitle())
            .createdAt(notice.getCreatedAt())
            .build());
  }

  @Transactional(readOnly = true)
  public Page<NoticeListResponse> searchNoticesByContent(
      NoticeType type, String keyword, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return noticeRepo.findByTypeAndContentContainingIgnoreCase(type, keyword, pageable)
        .map(notice -> NoticeListResponse.builder()
            .noticeId(notice.getNoticeId())
            .type(notice.getType())
            .title(notice.getTitle())
            .createdAt(notice.getCreatedAt())
            .build());
  }

  @Transactional(readOnly = true)
  public List<NoticeListResponse> getLatestNotices() {
    return noticeRepo.findTop5ByOrderByCreatedAtDesc().stream()
        .map(notice -> NoticeListResponse.builder()
            .noticeId(notice.getNoticeId())
            .type(notice.getType())
            .title(notice.getTitle())
            .createdAt(notice.getCreatedAt())
            .build())
        .toList();
  }

  @Transactional(readOnly = true)
  public NoticeDetailResponse getNoticeById(Long noticeId) {
    Notice notice = noticeRepo.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    return NoticeDetailResponse.builder()
        .noticeId(notice.getNoticeId())
        .type(notice.getType())
        .title(notice.getTitle())
        .content(notice.getContent())
        .attachmentUrl(notice.getAttachmentUrl())
        .createdAt(notice.getCreatedAt())
        .updatedAt(notice.getUpdatedAt())
        .build();
  }

  @Transactional
  public void updateNotice(Long noticeId, NoticeUpdateRequest req) {
    Notice notice = noticeRepo.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    if (req.getTitle() != null) {
      notice.setTitle(req.getTitle());
    }
    if (req.getContent() != null) {
      notice.setContent(req.getContent());
    }
    noticeRepo.save(notice);
  }

  @Transactional
  public void updateNoticeAttachment(Long noticeId, MultipartFile file) {
    Notice notice = noticeRepo.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

    validateFile(file);
    deleteFileIfExists(notice.getAttachmentUrl());
    String newAttachmentUrl = storeFile(file);

    notice.setAttachmentUrl(newAttachmentUrl);
    noticeRepo.save(notice);
  }

  @Transactional
  public void deleteNoticeAttachment(Long noticeId) {
    Notice notice = noticeRepo.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

    deleteFileIfExists(notice.getAttachmentUrl());
    notice.setAttachmentUrl(null);
    noticeRepo.save(notice);
  }

  private void deleteFileIfExists(String attachmentUrl) {
    if (attachmentUrl == null || attachmentUrl.isBlank()) {
      return;
    }

    String prefix = "/uploads/";
    if (!attachmentUrl.startsWith(prefix)) {
      return;
    }

    Path filePath = Paths.get("uploads").toAbsolutePath().normalize()
        .resolve(attachmentUrl.substring(prefix.length())).normalize();
    try {
      Files.deleteIfExists(filePath);
    } catch (IOException e) {
      throw new RuntimeException("기존 첨부파일 삭제에 실패했습니다.", e);
    }
  }

  @Transactional
  public void deleteNotice(Long noticeId) {
    Notice notice = noticeRepo.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    deleteFileIfExists(notice.getAttachmentUrl());
    noticeRepo.delete(notice);
  }
}

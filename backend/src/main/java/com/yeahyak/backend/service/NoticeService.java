package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.NoticeCreateRequest;
import com.yeahyak.backend.dto.NoticeCreateResponse;
import com.yeahyak.backend.dto.NoticeDetailResponse;
import com.yeahyak.backend.dto.NoticeListResponse;
import com.yeahyak.backend.dto.NoticeUpdateRequest;
import com.yeahyak.backend.entity.Notice;
import com.yeahyak.backend.entity.enums.NoticeType;
import com.yeahyak.backend.repository.NoticeRepository;
import com.yeahyak.backend.service.BlobStorageService.DownloadPayload;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

/**
 * 공지사항과 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class NoticeService {

  private final NoticeRepository noticeRepository;
  private final BlobStorageService blobStorageService;

  /**
   * 공지사항을 생성합니다.
   */
  @Transactional
  public NoticeCreateResponse createNotice(NoticeCreateRequest req, @Nullable MultipartFile file) {
    String blobName = null;

    try {
      if (file != null && !file.isEmpty()) {
        validateFile(file);
        BlobStorageService.UploadResult up = blobStorageService.upload(file);
        blobName = up.getBlobName();
      }

      Notice notice = Notice.builder()
          .type(req.getType())
          .title(req.getTitle())
          .content(req.getContent())
          .blobKey(blobName)
          .fileName(extractFileName(blobName))
          .viewCount(0)
          .build();
      noticeRepository.save(notice);
      return new NoticeCreateResponse(notice.getNoticeId());

    } catch (RuntimeException e) {
      if (blobName != null) {
        try {
          blobStorageService.delete(blobName);
        } catch (Exception ex) {
          log.warn("Failed to delete blob after notice creation failure: {}", blobName, ex);
        }
      }
      throw new RuntimeException("공지사항 등록에 실패했습니다.", e);
    }
  }

  /**
   * 업로드된 파일의 형식을 검증합니다.
   */
  private void validateFile(MultipartFile file) {
    String contentType = Optional.ofNullable(file.getContentType()).orElse("");
    String original = Optional.ofNullable(file.getOriginalFilename()).orElse("");
    String safeName = Paths.get(original).getFileName().toString();
    String lower = safeName.toLowerCase();

    boolean mimeOk = contentType.equalsIgnoreCase("application/pdf")
        || contentType.equalsIgnoreCase("text/plain");
    boolean extOk = lower.endsWith(".pdf") || lower.endsWith(".txt");

    if (!mimeOk || !extOk) {
      throw new RuntimeException("허용되지 않는 파일 형식입니다. (pdf, txt만 허용)");
    }
  }

  /**
   * 블롭 저장소에 저장된 파일명에서 실제 파일명을 추출합니다.
   */
  private @Nullable String extractFileName(String blobName) {
    if (blobName == null) {
      return null;
    }
    return blobName.contains("_") ? blobName.split("_", 2)[1] : blobName;
  }

  /**
   * 공지사항 목록을 조회합니다. (페이지네이션)
   */
  @Transactional(readOnly = true)
  public Page<NoticeListResponse> getNoticesByType(NoticeType type, int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return noticeRepository.findByType(type, pageable)
        .map(notice -> NoticeListResponse.builder()
            .noticeId(notice.getNoticeId())
            .type(notice.getType())
            .title(notice.getTitle())
            .createdAt(notice.getCreatedAt())
            .viewCount(notice.getViewCount())
            .build());
  }

  /**
   * 공지사항 목록을 제목으로 검색합니다. (페이지네이션)
   */
  @Transactional(readOnly = true)
  public Page<NoticeListResponse> searchNoticesByTitle(
      NoticeType type, String keyword, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return noticeRepository.findByTypeAndTitleContainingIgnoreCase(type, keyword, pageable)
        .map(notice -> NoticeListResponse.builder()
            .noticeId(notice.getNoticeId())
            .type(notice.getType())
            .title(notice.getTitle())
            .createdAt(notice.getCreatedAt())
            .viewCount(notice.getViewCount())
            .build());
  }

  /**
   * 공지사항 목록을 내용으로 검색합니다. (페이지네이션)
   */
  @Transactional(readOnly = true)
  public Page<NoticeListResponse> searchNoticesByContent(
      NoticeType type, String keyword, int page, int size
  ) {
    Pageable pageable = PageRequest.of(page, size, Sort.by(Direction.DESC, "createdAt"));
    return noticeRepository.findByTypeAndContentContainingIgnoreCase(type, keyword, pageable)
        .map(notice -> NoticeListResponse.builder()
            .noticeId(notice.getNoticeId())
            .type(notice.getType())
            .title(notice.getTitle())
            .createdAt(notice.getCreatedAt())
            .viewCount(notice.getViewCount())
            .build());
  }

  /**
   * 최신 공지사항 5개를 조회합니다.
   */
  @Transactional(readOnly = true)
  public List<NoticeListResponse> getLatestNotices() {
    return noticeRepository.findTop5ByOrderByCreatedAtDesc().stream()
        .map(notice -> NoticeListResponse.builder()
            .noticeId(notice.getNoticeId())
            .type(notice.getType())
            .title(notice.getTitle())
            .createdAt(notice.getCreatedAt())
            .viewCount(notice.getViewCount())
            .build())
        .toList();
  }

  /**
   * 공지사항 상세를 조회합니다.
   */
  @Transactional(readOnly = true)
  public NoticeDetailResponse getNoticeById(Long noticeId) {
    Notice notice = noticeRepository.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    return NoticeDetailResponse.builder()
        .noticeId(notice.getNoticeId())
        .type(notice.getType())
        .title(notice.getTitle())
        .content(notice.getContent())
        .fileName(notice.getFileName())
        .createdAt(notice.getCreatedAt())
        .updatedAt(notice.getUpdatedAt())
        .viewCount(notice.getViewCount())
        .build();
  }

  /**
   * 공지사항 상세를 조회하고 조회수를 1 증가시킵니다.
   */
  @Transactional
  public NoticeDetailResponse getNoticeByIdAndIncrease(Long noticeId) {
    int updated = noticeRepository.increaseViewCount(noticeId);
    if (updated == 0) {
      throw new RuntimeException("공지사항을 찾을 수 없습니다.");
    }
    Notice notice = noticeRepository.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

    return NoticeDetailResponse.builder()
        .noticeId(notice.getNoticeId())
        .type(notice.getType())
        .title(notice.getTitle())
        .content(notice.getContent())
        .fileName(notice.getFileName())
        .createdAt(notice.getCreatedAt())
        .updatedAt(notice.getUpdatedAt())
        .viewCount(notice.getViewCount())
        .build();
  }

  /**
   * 공지사항의 첨부파일을 다운로드합니다.
   */
  @Transactional(readOnly = true)
  public DownloadPayload download(Long noticeId) {
    Notice notice = noticeRepository.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    if (notice.getBlobKey() == null) {
      throw new RuntimeException("첨부파일이 없습니다.");
    }
    return blobStorageService.download(notice.getBlobKey());
  }

  /**
   * 공지사항을 수정합니다.
   */
  @Transactional
  public void updateNotice(Long noticeId, NoticeUpdateRequest req, @Nullable MultipartFile file) {
    Notice notice = noticeRepository.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));

    String newBlob = null;
    String oldBlob = notice.getBlobKey();

    try {
      if (Boolean.TRUE.equals(req.getRemoveFile()) && (file == null || file.isEmpty())) {
        notice.setBlobKey(null);
        notice.setFileName(null);
        if (oldBlob != null) {
          final String toDelete = oldBlob;
          TransactionSynchronizationManager.registerSynchronization(
              new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                  try {
                    blobStorageService.delete(toDelete);
                  } catch (Exception ex) {
                    log.warn("Post-commit delete failed. blobKey={}", toDelete, ex);
                  }
                }
              });
        }
        oldBlob = null;
      }

      if (file != null && !file.isEmpty()) {
        validateFile(file);
        BlobStorageService.UploadResult up = blobStorageService.upload(file);
        newBlob = up.getBlobName();

        notice.setBlobKey(newBlob);
        notice.setFileName(extractFileName(newBlob));

        if (oldBlob != null && !oldBlob.equals(newBlob)) {
          final String toDelete = oldBlob;
          TransactionSynchronizationManager.registerSynchronization(
              new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                  try {
                    blobStorageService.delete(toDelete);
                  } catch (Exception ex) {
                    log.warn("Post-commit delete failed: {}", toDelete, ex);
                  }
                }
              });
        }
      }

      if (req.getTitle() != null) {
        notice.setTitle(req.getTitle());
      }
      if (req.getContent() != null) {
        notice.setContent(req.getContent());
      }
      noticeRepository.save(notice);

    } catch (RuntimeException e) {
      if (newBlob != null) {
        try {
          blobStorageService.delete(newBlob);
        } catch (Exception ex) {
          log.warn("Post-commit delete failed: {}", newBlob, ex);
        }
      }
      throw new RuntimeException("공지사항 수정에 실패했습니다.", e);
    }
  }

  /**
   * 공지사항을 삭제합니다.
   */
  @Transactional
  public void deleteNotice(Long noticeId) {
    Notice notice = noticeRepository.findById(noticeId)
        .orElseThrow(() -> new RuntimeException("공지사항을 찾을 수 없습니다."));
    String blob = notice.getBlobKey();
    noticeRepository.delete(notice);
    if (blob != null) {
      final String toDelete = blob;
      TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
        @Override
        public void afterCommit() {
          try {
            blobStorageService.delete(toDelete);
          } catch (Exception ex) {
            log.warn("Post-commit delete failed: {}", toDelete, ex);
          }
        }
      });
    }
  }
}

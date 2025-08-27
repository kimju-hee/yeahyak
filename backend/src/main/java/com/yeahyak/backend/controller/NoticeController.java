package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.NoticeCreateRequest;
import com.yeahyak.backend.dto.NoticeCreateResponse;
import com.yeahyak.backend.dto.NoticeDetailResponse;
import com.yeahyak.backend.dto.NoticeListResponse;
import com.yeahyak.backend.dto.NoticeUpdateRequest;
import com.yeahyak.backend.entity.enums.NoticeType;
import com.yeahyak.backend.service.NoticeService;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
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

/**
 * 공지사항 관련 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/notices")
@RequiredArgsConstructor
public class NoticeController {

  private final NoticeService noticeService;

  /**
   * 공지사항을 생성합니다.
   */
  @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<ApiResponse<NoticeCreateResponse>> createNotice(
      @RequestPart("notice") NoticeCreateRequest request,
      @RequestPart(value = "file", required = false) MultipartFile file
  ) {
    NoticeCreateResponse res = noticeService.createNotice(request, file);
    URI location = URI.create("/api/notices/" + res.getNoticeId());
    return ResponseEntity
        .created(location)
        .body(ApiResponse.ok(res)); // 201 Created
  }

  /**
   * 공지사항 목록을 조회합니다. (타입/키워드/검색범위 + 페이지네이션)
   */
  @GetMapping
  public ResponseEntity<ApiResponse<List<NoticeListResponse>>> list(
      @RequestParam NoticeType type,
      @RequestParam(required = false) String keyword,
      @RequestParam(defaultValue = "TITLE") NoticeSearchScope scope,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size
  ) {
    final boolean hasKeyword = (keyword != null && !keyword.isBlank());

    Page<NoticeListResponse> result;
    if (!hasKeyword) {
      result = noticeService.getNoticesByType(type, page, size);
    } else if (scope == NoticeSearchScope.TITLE) {
      result = noticeService.searchNoticesByTitle(type, keyword, page, size);
    } else /* if (scope == NoticeSearchScope.CONTENT) */ {
      result = noticeService.searchNoticesByContent(type, keyword, page, size);
    }

    return ResponseEntity.ok(ApiResponse.withPagination(result)); // 200 OK
  }

  /**
   * 최신 공지사항 5개를 조회합니다.
   */
  @GetMapping("/latest")
  public ResponseEntity<ApiResponse<List<NoticeListResponse>>> getLatest() {
    List<NoticeListResponse> list = noticeService.getLatestNotices();
    return ResponseEntity.ok(ApiResponse.ok(list)); // 200 OK
  }

  /**
   * 공지사항 상세를 조회합니다.
   */
  @GetMapping("/{noticeId}")
  public ResponseEntity<ApiResponse<NoticeDetailResponse>> getDetail(
      @PathVariable Long noticeId
  ) {
    NoticeDetailResponse detail = noticeService.getNoticeById(noticeId);
    return ResponseEntity.ok(ApiResponse.ok(detail)); // 200 OK
  }

  /**
   * 공지사항을 수정합니다.
   */
  @PatchMapping("/{noticeId}")
  public ResponseEntity<Void> updateNotice(
      @PathVariable Long noticeId,
      @RequestBody NoticeUpdateRequest request
  ) {
    noticeService.updateNotice(noticeId, request);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 공지사항 첨부파일을 수정합니다.
   */
  @PutMapping(path = "/{noticeId}/attachment", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<Void> updateAttachment(
      @PathVariable Long noticeId,
      @RequestPart("file") MultipartFile file
  ) {
    noticeService.updateNoticeAttachment(noticeId, file);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 공지사항 첨부파일을 삭제합니다.
   */
  @DeleteMapping("/{noticeId}/attachment")
  public ResponseEntity<Void> deleteAttachment(
      @PathVariable Long noticeId
  ) {
    noticeService.deleteNoticeAttachment(noticeId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 공지사항을 삭제합니다.
   */
  @DeleteMapping("/{noticeId}")
  public ResponseEntity<Void> deleteNotice(
      @PathVariable Long noticeId
  ) {
    noticeService.deleteNotice(noticeId);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 공지사항 검색 범위.
   */
  public enum NoticeSearchScope {
    TITLE,
    CONTENT
  }
}

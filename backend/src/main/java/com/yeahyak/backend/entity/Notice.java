package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.NoticeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

/**
 * Notice Entity representing a notice in the system.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "notices")
public class Notice {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "notice_id")
  private Long noticeId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 45)
  private NoticeType type;

  @Column(nullable = false, length = 100)
  private String title;

  @Lob
  @Column(nullable = false, columnDefinition = "TEXT")
  private String content;

  @Column(name = "blob_key", length = 512)
  private String blobKey;

  @Column(name = "file_name", length = 255)
  private String fileName;
  
  @CreationTimestamp // 생성 시각 자동 저장
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp // 수정 시각 자동 저장
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @Column(name = "view_count", nullable = false)
  private Integer viewCount;
}

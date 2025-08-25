package com.yeahyak.backend.repository;

import com.yeahyak.backend.entity.Notice;
import com.yeahyak.backend.entity.enums.NoticeType;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

public interface NoticeRepository extends JpaRepository<Notice, Long> {

  Page<Notice> findByType(NoticeType type, Pageable pageable);

  Page<Notice> findByTypeAndTitleContainingIgnoreCase(
      @Param("type") NoticeType type,
      @Param("keyword") String keyword,
      Pageable pageable
  );

  Page<Notice> findByTypeAndContentContainingIgnoreCase(
      @Param("type") NoticeType type,
      @Param("keyword") String keyword,
      Pageable pageable
  );

  List<Notice> findTop5ByOrderByCreatedAtDesc();
}

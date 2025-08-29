package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.PharmacyRequestStatus;
import com.yeahyak.backend.entity.enums.Region;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
 * Represents a pharmacy request made by a user.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "pharmacy_requests")
public class PharmacyRequest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "pharmacy_request_id")
  private Long pharmacyRequestId;

  @OneToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "user_id", nullable = false, unique = true)
  private User user;

  @Column(name = "pharmacy_name", nullable = false, length = 100)
  private String pharmacyName;

  @Column(name = "biz_reg_no", nullable = false, unique = true, length = 20)
  private String bizRegNo;

  @Column(name = "representative_name", nullable = false, length = 45)
  private String representativeName;

  @Column(nullable = false, length = 20)
  private String postcode;

  @Column(nullable = false, length = 255)
  private String address;

  @Column(name = "detail_address", length = 255)
  private String detailAddress;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 45)
  private Region region;

  @Column(nullable = false, length = 20)
  private String contact;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 45)
  private PharmacyRequestStatus status;

  @CreationTimestamp
  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @UpdateTimestamp
  @Column(name = "updated_at")
  private LocalDateTime updatedAt;
}

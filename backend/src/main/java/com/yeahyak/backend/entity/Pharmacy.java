package com.yeahyak.backend.entity;

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
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Pharmacy entity representing a pharmacy in the system.
 */
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "pharmacies")
public class Pharmacy {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "pharmacy_id")
  private Long pharmacyId;

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

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal balance;
}

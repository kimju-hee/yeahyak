package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.Status;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "pharmacyregistrationrequests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PharmacyRegistrationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long regRequestId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pharmacy_id")
    private Pharmacy pharmacy;

    private LocalDateTime requestedAt;

    private LocalDateTime reviewedAt;

    @Enumerated(EnumType.STRING)
    private Status status;
}

package com.yeahyak.backend.entity;

import com.yeahyak.backend.entity.enums.Status;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "pharmacies", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"pharmacy_name"}),
        @UniqueConstraint(columnNames = {"biz_reg_no"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Pharmacy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long pharmacyId;

    @Column(nullable = false, length = 100)
    private String pharmacyName;

    @Column(nullable = false, length = 20)
    private String bizRegNo;

    @Column(nullable = false, length = 50)
    private String representativeName;

    @Column(nullable = false, length = 255)
    private String address;

    @Column(nullable = false)
    private String postcode;

    @Column(length = 255)
    private String detailAddress;

    @Column(length = 20)
    private String phoneNumber;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Status status;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @PrePersist
    public void prePersist() {
        if (this.status == null) {
            this.status = Status.PENDING;
        }
    }
}

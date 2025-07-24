package com.yeahyak.backend.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.yeahyak.backend.entity.*;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

import org.springframework.test.annotation.Rollback;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class PharmacyAdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PharmacyRepository pharmacyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void clearDatabase() {
        pharmacyRepository.deleteAll();
        userRepository.deleteAll();
    }


    @Test
    @DisplayName("관리자 권한으로 PENDING 약국 목록 조회 성공")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getPendingPharmacies_success() throws Exception {
        User user = User.builder()
                .email("test@pharmacy.com")
                .password("encodedpassword")
                .userRole(UserRole.ADMIN)
                .build();
        userRepository.save(user);

        Pharmacy pharmacy = Pharmacy.builder()
                .pharmacyName("테스트약국3")
                .bizRegNo("123456789023")
                .representativeName("홍길동")
                .address("서울시 강남구")
                .phoneNumber("010-1234-5678")
                .status(Status.PENDING)
                .user(user)
                .build();
        pharmacyRepository.save(pharmacy);

        mockMvc.perform(get("/api/admin/pharmacies/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[*].pharmacyName").value(Matchers.hasItem("테스트약국3")));
    }

    @Test
    @Transactional
    @DisplayName("약국 승인 성공 - 약국 상태 변경 및 유저 권한 변경")
    @Rollback(false)
    void approvePharmacy_success() throws Exception {
        User user = userRepository.save(User.builder()
                .email("admin@example.com")
                .password(passwordEncoder.encode("password"))
                .userRole(UserRole.ADMIN)
                .build());

        Pharmacy pharmacy = pharmacyRepository.save(Pharmacy.builder()
                .pharmacyName("승인대기약국")
                .bizRegNo("9998887777")
                .representativeName("이승철")
                .address("부산광역시 해운대구")
                .phoneNumber("010-2222-3333")
                .status(Status.PENDING)
                .user(user)
                .build());

        mockMvc.perform(post("/api/admin/pharmacies/" + pharmacy.getPharmacyId() + "/approve")
                        .with(user("admin@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(content().string("약국이 승인되었고, 권한이 부여되었습니다."));

        Pharmacy updated = pharmacyRepository.findById(pharmacy.getPharmacyId()).orElseThrow();
        assertEquals(Status.ACTIVE, updated.getStatus());

        User updatedUser = userRepository.findById(user.getUserId()).orElseThrow();
        assertEquals(UserRole.PHARMACIST, updatedUser.getUserRole());
    }

    @Test
    @Transactional
    @DisplayName("약국 거절 성공 - 약국 상태 변경 유지 및 유저 권한 미변경")
    @Rollback(false)
    void rejectPharmacy_success() throws Exception {
        User user = userRepository.save(User.builder()
                .email("reject@example.com")
                .password(passwordEncoder.encode("password"))
                .userRole(UserRole.ADMIN)
                .build());

        Pharmacy pharmacy = pharmacyRepository.save(Pharmacy.builder()
                .pharmacyName("거절대기약국_" + UUID.randomUUID())
                .bizRegNo("8887776666")
                .representativeName("박거절")
                .address("인천광역시 미추홀구")
                .phoneNumber("010-3333-4444")
                .status(Status.PENDING)
                .user(user)
                .build());

        mockMvc.perform(post("/api/admin/pharmacies/" + pharmacy.getPharmacyId() + "/reject")
                        .with(user("reject@example.com").roles("ADMIN")))
                .andExpect(status().isOk())
                .andExpect(content().string("약국이 거절되었습니다."));

        Pharmacy updated = pharmacyRepository.findById(pharmacy.getPharmacyId()).orElseThrow();
        assertEquals(Status.REJECTED, updated.getStatus());

        User updatedUser = userRepository.findById(user.getUserId()).orElseThrow();
        assertEquals(UserRole.ADMIN, updatedUser.getUserRole());
    }

}

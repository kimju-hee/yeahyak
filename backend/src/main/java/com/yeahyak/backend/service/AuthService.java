package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.*;
import com.yeahyak.backend.entity.*;
import com.yeahyak.backend.repository.AdminRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PharmacyRepository pharmacyRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final AdminRepository adminRepository;

    @Transactional
    public void register(SignupRequest request) {
        validateDuplication(request);

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .userRole(UserRole.BRANCH)
                .build();
        userRepository.save(user);

        Pharmacy pharmacy = Pharmacy.builder()
                .pharmacyName(request.getPharmacyName())
                .bizRegNo(request.getBizRegNo())
                .representativeName(request.getRepresentativeName())
                .postcode(request.getPostcode())
                .address(request.getAddress())
                .detailAddress(request.getDetailAddress())
                .phoneNumber(request.getContact())
                .status(Status.PENDING)
                .user(user)
                .build();
        pharmacyRepository.save(pharmacy);
    }

    private void validateDuplication(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 등록된 이메일입니다.");
        }
        if (pharmacyRepository.existsByPharmacyName(request.getPharmacyName())) {
            throw new IllegalArgumentException("이미 등록된 약국명입니다.");
        }
        if (pharmacyRepository.existsByBizRegNo(request.getBizRegNo())) {
            throw new IllegalArgumentException("이미 등록된 사업자등록번호입니다.");
        }
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        Pharmacy pharmacy = pharmacyRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("약국 정보를 찾을 수 없습니다."));

        UserInfo userInfo = new UserInfo(
                user.getUserId(),
                user.getEmail(),
                user.getPoint(),
                user.getUserRole().name()
        );

        PharmacyProfile profile = new PharmacyProfile(
                pharmacy.getPharmacyId(),
                user.getUserId(),
                pharmacy.getPharmacyName(),
                pharmacy.getBizRegNo(),
                pharmacy.getRepresentativeName(),
                pharmacy.getPostcode(),
                pharmacy.getAddress(),
                pharmacy.getDetailAddress(),
                pharmacy.getPhoneNumber(),
                pharmacy.getStatus().name()
        );

        return new LoginResponse(userInfo, profile);
    }


    public void updatePharmacy(Long pharmacyId, UpdatePharmacyRequest request) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new IllegalArgumentException("해당 약국이 존재하지 않습니다."));

        pharmacy.setPharmacyName(request.getPharmacyName());
        pharmacy.setRepresentativeName(request.getRepresentativeName());
        pharmacy.setAddress(request.getAddress());
        pharmacy.setPhoneNumber(request.getPhoneNumber());

        pharmacyRepository.save(pharmacy);
    }

    @Transactional
    public void registerAdmin(AdminSignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 등록된 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .userRole(UserRole.ADMIN)
                .build();
        userRepository.save(user);

        Admin admin = Admin.builder()
                .adminName(request.getAdminName())
                .department(request.getDepartment())
                .user(user)
                .build();
        adminRepository.save(admin);
    }
}

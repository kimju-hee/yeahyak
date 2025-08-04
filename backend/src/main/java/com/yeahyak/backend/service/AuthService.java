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
                .point(0)
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

        int safePoint = user.getPoint() != null ? user.getPoint() : 0;

        UserInfo userInfo = new UserInfo(
                user.getUserId(),
                user.getEmail(),
                safePoint,
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

    public AdminLoginResponse adminLogin(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자가 존재하지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        if (user.getUserRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("관리자 권한이 없습니다.");
        }

        Admin admin = adminRepository.findByUser(user)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보가 존재하지 않습니다."));

        int safePoint = user.getPoint() != null ? user.getPoint() : 0;

        UserInfo userInfo = new UserInfo(user.getUserId(), user.getEmail(), safePoint, user.getUserRole().name());
        AdminProfile profile = new AdminProfile(admin.getAdminId(), user.getUserId(), admin.getAdminName(), admin.getDepartment().name());

        return new AdminLoginResponse(userInfo, profile);
    }

    public PharmacyProfile updatePharmacy(Long pharmacyId, UpdatePharmacyRequest request) {
        Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
                .orElseThrow(() -> new IllegalArgumentException("해당 약국이 존재하지 않습니다."));

        pharmacy.setPharmacyName(request.getPharmacyName());
        pharmacy.setRepresentativeName(request.getRepresentativeName());
        pharmacy.setAddress(request.getAddress());
        pharmacy.setDetailAddress(request.getDetailAddress());
        pharmacy.setPostcode(request.getPostcode());
        pharmacy.setPhoneNumber(request.getContact());

        pharmacy.setStatus(Status.valueOf(request.getStatus()));

        pharmacyRepository.save(pharmacy);

        return new PharmacyProfile(
                pharmacy.getPharmacyId(),
                pharmacy.getUser().getUserId(),
                pharmacy.getPharmacyName(),
                pharmacy.getBizRegNo(),
                pharmacy.getRepresentativeName(),
                pharmacy.getPostcode(),
                pharmacy.getAddress(),
                pharmacy.getDetailAddress(),
                pharmacy.getPhoneNumber(),
                pharmacy.getStatus().name()
        );
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
                .point(0)
                .build();
        userRepository.save(user);

        Department department;
        try {
            department = Department.valueOf(request.getDepartment());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 부서입니다. (운영팀, 총무팀 중 선택)");
        }

        Admin admin = Admin.builder()
                .adminName(request.getAdminName())
                .department(department)
                .user(user)
                .build();
        adminRepository.save(admin);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 일치하지 않습니다.");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Transactional
    public AdminProfile updateAdmin(Long adminId, UpdateAdminRequest request) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("해당 관리자가 존재하지 않습니다."));

        admin.setAdminName(request.getAdminName());

        Department department;
        try {
            department = Department.valueOf(request.getDepartment());
        } catch (IllegalArgumentException e) {
            throw new IllegalArgumentException("유효하지 않은 부서입니다. (운영팀, 총무팀 중 선택)");
        }
        admin.setDepartment(department);

        adminRepository.save(admin);

        return new AdminProfile(
                admin.getAdminId(),
                admin.getUser().getUserId(),
                admin.getAdminName(),
                admin.getDepartment().name()
        );
    }
}

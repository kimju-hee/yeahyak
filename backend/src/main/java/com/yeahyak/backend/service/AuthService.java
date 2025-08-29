package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.AdminLoginResponse;
import com.yeahyak.backend.dto.AdminProfile;
import com.yeahyak.backend.dto.AdminSignupRequest;
import com.yeahyak.backend.dto.AdminSignupResponse;
import com.yeahyak.backend.dto.AdminUpdateRequest;
import com.yeahyak.backend.dto.LoginRequest;
import com.yeahyak.backend.dto.PasswordChangeRequest;
import com.yeahyak.backend.dto.PharmacyLoginResponse;
import com.yeahyak.backend.dto.PharmacyProfile;
import com.yeahyak.backend.dto.PharmacySignupRequest;
import com.yeahyak.backend.dto.PharmacySignupResponse;
import com.yeahyak.backend.dto.PharmacyUpdateRequest;
import com.yeahyak.backend.dto.UserInfo;
import com.yeahyak.backend.entity.Admin;
import com.yeahyak.backend.entity.Pharmacy;
import com.yeahyak.backend.entity.PharmacyRequest;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.enums.PharmacyRequestStatus;
import com.yeahyak.backend.entity.enums.UserRole;
import com.yeahyak.backend.repository.AdminRepository;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.PharmacyRequestRepository;
import com.yeahyak.backend.repository.UserRepository;
import com.yeahyak.backend.security.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * 인증 및 사용자 관리와 관련된 비즈니스 로직을 처리하는 서비스 클래스입니다.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

  private final UserRepository userRepository;
  private final AdminRepository adminRepository;
  private final PharmacyRepository pharmacyRepository;
  private final PharmacyRequestRepository pharmacyRequestRepository;
  private final PasswordEncoder passwordEncoder;
  private final AuthenticationManager authenticationManager;
  private final JwtProvider jwtProvider;

  /**
   * 관리자 계정으로 회원가입합니다.
   */
  @Transactional
  public AdminSignupResponse adminSignup(AdminSignupRequest req) {
    if (userRepository.existsByEmail(req.getEmail())) {
      throw new RuntimeException("이미 등록된 이메일입니다.");
    }

    User user = User.builder()
        .email(req.getEmail())
        .password(passwordEncoder.encode(req.getPassword()))
        .role(UserRole.ADMIN)
        .build();
    userRepository.save(user);

    Admin admin = Admin.builder()
        .user(user)
        .adminName(req.getAdminName())
        .department(req.getDepartment())
        .build();
    adminRepository.save(admin);

    return new AdminSignupResponse(user.getUserId(), admin.getAdminId());
  }

  /**
   * 약국 계정으로 회원가입합니다.
   */
  @Transactional
  public PharmacySignupResponse pharmacySignup(PharmacySignupRequest req) {
    if (userRepository.existsByEmail(req.getEmail())) {
      throw new RuntimeException("이미 등록된 이메일입니다.");
    }
    if (pharmacyRepository.existsByBizRegNo(req.getBizRegNo())) {
      throw new RuntimeException("이미 등록된 사업자등록번호입니다.");
    }
    if (pharmacyRequestRepository.existsByBizRegNo(req.getBizRegNo())) {
      throw new RuntimeException("이미 등록 요청된 사업자등록번호입니다. 관리자에게 문의해주세요.");
    }

    User user = User.builder()
        .email(req.getEmail())
        .password(passwordEncoder.encode(req.getPassword()))
        .role(UserRole.PHARMACY)
        .build();
    userRepository.save(user);

    PharmacyRequest pharmacyRequest = PharmacyRequest.builder()
        .user(user)
        .status(PharmacyRequestStatus.PENDING)
        .pharmacyName(req.getPharmacyName())
        .bizRegNo(req.getBizRegNo())
        .representativeName(req.getRepresentativeName())
        .postcode(req.getPostcode())
        .address(req.getAddress())
        .detailAddress(req.getDetailAddress())
        .region(req.getRegion())
        .contact(req.getContact())
        .build();
    pharmacyRequestRepository.save(pharmacyRequest);

    return new PharmacySignupResponse(user.getUserId(), pharmacyRequest.getPharmacyRequestId());
  }

  /**
   * 관리자 계정으로 로그인합니다.
   */
  public AdminLoginResponse adminLogin(LoginRequest req) {
    Authentication authentication;
    try {
      authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
      );
    } catch (AuthenticationException e) {
      throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    User user = (User) authentication.getPrincipal();

    if (user.getRole() != UserRole.ADMIN) {
      throw new RuntimeException("약국으로 로그인해주세요.");
    }

    Admin admin = adminRepository.findByUser(user)
        .orElseThrow(() -> new RuntimeException("관리자 정보를 찾을 수 없습니다."));

    String accessToken = jwtProvider.createAccessToken(user);

    UserInfo userInfo = new UserInfo(
        user.getUserId(),
        user.getEmail(),
        user.getRole()
    );

    AdminProfile profile = new AdminProfile(
        admin.getAdminId(),
        admin.getAdminName(),
        admin.getDepartment()
    );

    return new AdminLoginResponse(accessToken, userInfo, profile);
  }

  /**
   * 약국 계정으로 로그인합니다.
   */
  public PharmacyLoginResponse pharmacyLogin(LoginRequest req) {
    Authentication authentication;
    try {
      authentication = authenticationManager.authenticate(
          new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
      );
    } catch (AuthenticationException e) {
      throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
    }

    User user = (User) authentication.getPrincipal();

    if (user.getRole() != UserRole.PHARMACY) {
      throw new RuntimeException("관리자로 로그인해주세요.");
    }

    boolean hasPharmacy = pharmacyRepository.existsByUser(user);
    if (!hasPharmacy) {
      PharmacyRequest pharmacyRequest = pharmacyRequestRepository.findByUser(user).orElse(null);
      if (pharmacyRequest == null) {
        throw new RuntimeException("약국 등록 요청이 존재하지 않습니다. 관리자에게 문의해주세요.");
      }
      switch (pharmacyRequest.getStatus()) {
        case PENDING -> throw new RuntimeException("약국 등록 요청이 승인 대기 중입니다.");
        case REJECTED -> throw new RuntimeException("약국 등록 요청이 거부되었습니다.");
        default -> throw new RuntimeException("약국 등록 요청 상태가 올바르지 않습니다. 관리자에게 문의해주세요.");
      }
    }

    Pharmacy pharmacy = pharmacyRepository.findByUser(user)
        .orElseThrow(() -> new RuntimeException("약국 정보를 찾을 수 없습니다."));

    String accessToken = jwtProvider.createAccessToken(user);

    UserInfo userInfo = new UserInfo(
        user.getUserId(),
        user.getEmail(),
        user.getRole()
    );

    PharmacyProfile profile = new PharmacyProfile(
        pharmacy.getPharmacyId(),
        pharmacy.getPharmacyName(),
        pharmacy.getBizRegNo(),
        pharmacy.getRepresentativeName(),
        pharmacy.getPostcode(),
        pharmacy.getAddress(),
        pharmacy.getDetailAddress(),
        pharmacy.getRegion(),
        pharmacy.getContact(),
        pharmacy.getBalance()
    );

    return new PharmacyLoginResponse(accessToken, userInfo, profile);
  }

  /**
   * 비밀번호를 변경합니다.
   */
  @Transactional
  public void changePassword(Long userId, PasswordChangeRequest req) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
      throw new RuntimeException("현재 비밀번호가 일치하지 않습니다.");
    }
    if (passwordEncoder.matches(req.getNewPassword(), user.getPassword())) {
      throw new RuntimeException("현재 비밀번호와 동일한 비밀번호로 변경할 수 없습니다.");
    }

    user.setPassword(passwordEncoder.encode(req.getNewPassword()));
    userRepository.save(user);
  }

  /**
   * 관리자 프로필을 수정합니다.
   */
  @Transactional
  public AdminProfile updateAdmin(Long adminId, AdminUpdateRequest req) {
    Admin admin = adminRepository.findById(adminId)
        .orElseThrow(() -> new RuntimeException("관리자 정보를 찾을 수 없습니다."));

    if (req.getAdminName() != null) {
      admin.setAdminName(req.getAdminName());
    }
    if (req.getDepartment() != null) {
      admin.setDepartment(req.getDepartment());
    }
    adminRepository.save(admin);

    return new AdminProfile(
        admin.getAdminId(),
        admin.getAdminName(),
        admin.getDepartment()
    );
  }

  /**
   * 약국 프로필을 수정합니다.
   */
  @Transactional
  public PharmacyProfile updatePharmacy(Long pharmacyId, PharmacyUpdateRequest req) {
    Pharmacy pharmacy = pharmacyRepository.findById(pharmacyId)
        .orElseThrow(() -> new RuntimeException("약국 정보를 찾을 수 없습니다."));

    if (req.getPharmacyName() != null) {
      pharmacy.setPharmacyName(req.getPharmacyName());
    }
    if (req.getRepresentativeName() != null) {
      pharmacy.setRepresentativeName(req.getRepresentativeName());
    }
    if (req.getPostcode() != null) {
      pharmacy.setPostcode(req.getPostcode());
    }
    if (req.getAddress() != null) {
      pharmacy.setAddress(req.getAddress());
    }
    if (req.getDetailAddress() != null) {
      pharmacy.setDetailAddress(req.getDetailAddress());
    }
    if (req.getRegion() != null) {
      pharmacy.setRegion(req.getRegion());
    }
    if (req.getContact() != null) {
      pharmacy.setContact(req.getContact());
    }
    pharmacyRepository.save(pharmacy);

    return new PharmacyProfile(
        pharmacy.getPharmacyId(),
        pharmacy.getPharmacyName(),
        pharmacy.getBizRegNo(),
        pharmacy.getRepresentativeName(),
        pharmacy.getPostcode(),
        pharmacy.getAddress(),
        pharmacy.getDetailAddress(),
        pharmacy.getRegion(),
        pharmacy.getContact(),
        pharmacy.getBalance()
    );
  }
}

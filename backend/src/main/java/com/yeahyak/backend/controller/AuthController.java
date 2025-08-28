package com.yeahyak.backend.controller;

import java.net.URI;
import java.util.Map;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.yeahyak.backend.dto.AdminLoginResponse;
import com.yeahyak.backend.dto.AdminProfile;
import com.yeahyak.backend.dto.AdminSignupRequest;
import com.yeahyak.backend.dto.AdminSignupResponse;
import com.yeahyak.backend.dto.AdminUpdateRequest;
import com.yeahyak.backend.dto.ApiResponse;
import com.yeahyak.backend.dto.LoginRequest;
import com.yeahyak.backend.dto.PasswordChangeRequest;
import com.yeahyak.backend.dto.PharmacyLoginResponse;
import com.yeahyak.backend.dto.PharmacyProfile;
import com.yeahyak.backend.dto.PharmacySignupRequest;
import com.yeahyak.backend.dto.PharmacySignupResponse;
import com.yeahyak.backend.dto.PharmacyUpdateRequest;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.repository.UserRepository;
import com.yeahyak.backend.security.CustomUserDetails;
import com.yeahyak.backend.security.JwtProvider;
import com.yeahyak.backend.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;

/**
 * 인증 및 인가 관련 API를 처리하는 컨트롤러입니다.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final JwtProvider jwtProvider;
  private final UserRepository userRepo;

  private ResponseCookie buildRefreshCookie(String refreshToken, long maxAge) {
    return ResponseCookie.from("refreshToken", refreshToken)
        .httpOnly(true)
        .secure(false) // 로컬 개발 시 false, 배포 시 true로 변경
        .sameSite("Lax") // 로컬 개발 시 Lax, 배포 시 None으로 변경
        .path("/")
        .maxAge(maxAge) // 7일
        .build();
  }

  /**
   * (관리자) 회원가입.
   */
  @PostMapping("/admin/signup")
  public ResponseEntity<ApiResponse<AdminSignupResponse>> adminSignup(
      @RequestBody AdminSignupRequest request
  ) {
    AdminSignupResponse res = authService.adminSignup(request);
    // 생성된 관리자 리소스 위치
    URI location = URI.create("/api/admins/" + res.getAdminId());
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }

  /**
   * (약국) 회원가입.
   */
  @PostMapping("/pharmacy/signup")
  public ResponseEntity<ApiResponse<PharmacySignupResponse>> pharmacySignup(
      @RequestBody PharmacySignupRequest request
  ) {
    PharmacySignupResponse res = authService.pharmacySignup(request);
    // 함께 생성된 약국 등록 요청 리소스 위치
    URI location = URI.create("/api/pharmacy-requests/" + res.getPharmacyRequestId());
    return ResponseEntity.created(location).body(ApiResponse.ok(res)); // 201 Created
  }

  /**
   * (관리자) 로그인.
   */
  @PostMapping("/admin/login")
  public ResponseEntity<ApiResponse<AdminLoginResponse>> adminLogin(
      @RequestBody LoginRequest request,
      HttpServletResponse response
  ) {
    AdminLoginResponse res = authService.adminLogin(request);
    User user = userRepo.findByEmail(res.getUser().getEmail())
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    String refreshToken = jwtProvider.createRefreshToken(user);
    ResponseCookie refreshCookie = buildRefreshCookie(refreshToken, 7 * 24 * 60 * 60);
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

    return ResponseEntity.ok(ApiResponse.ok(res)); // 200 OK
  }

  /**
   * (약국) 로그인.
   */
  @PostMapping("/pharmacy/login")
  public ResponseEntity<ApiResponse<PharmacyLoginResponse>> pharmacyLogin(
      @RequestBody LoginRequest request,
      HttpServletResponse response
  ) {
    PharmacyLoginResponse res = authService.pharmacylogin(request);
    User user = userRepo.findByEmail(res.getUser().getEmail())
        .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

    String refreshToken = jwtProvider.createRefreshToken(user);
    ResponseCookie refreshCookie = buildRefreshCookie(refreshToken, 7 * 24 * 60 * 60);
    response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

    return ResponseEntity.ok(ApiResponse.ok(res)); // 200 OK
  }

  /**
   * 토큰을 재발급합니다.
   */
  @PostMapping("/refresh")
  public ResponseEntity<ApiResponse<Map<String, String>>> refreshToken(
      @CookieValue(value = "refreshToken", required = false) String refreshToken,
      HttpServletResponse response
  ) {
    if (refreshToken == null || !jwtProvider.validateToken(refreshToken)) {
      return ResponseEntity.status(401)
          .body(ApiResponse.<Map<String, String>>builder()
              .success(false)
              .data(Map.of("message", "Refresh Token이 유효하지 않습니다."))
              .build());
    }

    String email = jwtProvider.getClaims(refreshToken).getSubject();
    User user = userRepo.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

    String newAccessToken = jwtProvider.createAccessToken(user);

    String newRefreshToken = jwtProvider.createRefreshToken(user);
    ResponseCookie newRefreshCookie = buildRefreshCookie(newRefreshToken, 7 * 24 * 60 * 60);
    response.addHeader(HttpHeaders.SET_COOKIE, newRefreshCookie.toString());

    return ResponseEntity.ok(ApiResponse.ok(Map.of("accessToken", newAccessToken))); // 200 OK
  }

  /**
   * 비밀번호를 변경합니다.
   */
  @PostMapping("/password")
  public ResponseEntity<Void> changePassword(
      @RequestBody PasswordChangeRequest request
  ) {
    Authentication auth = SecurityContextHolder.getContext().getAuthentication();
    if (auth == null || !auth.isAuthenticated()) {
      return ResponseEntity.status(401).build(); // 401 Unauthorized
    }
    CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
    Long userId = userDetails.getUserId();
    authService.changePassword(userId, request);
    return ResponseEntity.noContent().build(); // 204 No Content
  }

  /**
   * 관리자 프로필을 수정합니다.
   */
  @PatchMapping("/admin/{adminId}")
  public ResponseEntity<ApiResponse<AdminProfile>> updateAdmin(
      @PathVariable Long adminId,
      @RequestBody AdminUpdateRequest request
  ) {
    AdminProfile profile = authService.updateAdmin(adminId, request);
    return ResponseEntity.ok(ApiResponse.ok(profile)); // FE 동기화 편의상 200 OK + 데이터 반환
  }

  /**
   * 약국 프로필을 수정합니다.
   */
  @PatchMapping("/pharmacy/{pharmacyId}")
  public ResponseEntity<ApiResponse<PharmacyProfile>> updatePharmacy(
      @PathVariable Long pharmacyId,
      @RequestBody PharmacyUpdateRequest request
  ) {
    PharmacyProfile profile = authService.updatePharmacy(pharmacyId, request);
    return ResponseEntity.ok(ApiResponse.ok(profile)); // FE 동기화 편의상 200 OK + 데이터 반환
  }

  /**
   * 로그아웃.
   */
  @PostMapping("/logout")
  public ResponseEntity<Void> logout(HttpServletResponse response) {
    response.addHeader(HttpHeaders.SET_COOKIE, buildRefreshCookie("", 0).toString());
    return ResponseEntity.noContent().build(); // 204 No Content
  }
}

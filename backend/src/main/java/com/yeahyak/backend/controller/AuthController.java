package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.*;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.repository.UserRepository;
import com.yeahyak.backend.security.JwtUtil;
import com.yeahyak.backend.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest request) {
        authService.register(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다. 관리자의 승인을 기다립니다.");
    }

    @PostMapping("/admin/signup")
    public ResponseEntity<ApiResponse<String>> adminSignup(@Valid @RequestBody AdminSignupRequest request) {
        authService.registerAdmin(request);
        return ResponseEntity.ok(new ApiResponse<>(true, ""));
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(HttpServletRequest request) {
        String refreshToken = null;

        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken == null || !jwtUtil.validateToken(refreshToken)) {
            return ResponseEntity.status(401).body("Refresh Token이 유효하지 않습니다.");
        }

        String email = jwtUtil.getClaims(refreshToken).getSubject();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String newAccessToken = jwtUtil.createAccessToken(user);

        return ResponseEntity.ok().body(Map.of("accessToken", newAccessToken));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {

        LoginResponse loginResponse = authService.login(request);
        String email = loginResponse.getUser().getEmail();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String accessToken = jwtUtil.createAccessToken(user);
        String refreshToken = jwtUtil.createRefreshToken(user);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok()
                .body(Map.of(
                        "success", true,
                        "data", Map.of(
                                "accessToken", accessToken,
                                "user", loginResponse.getUser(),
                                "profile", loginResponse.getProfile()
                        )
                ));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<?> adminLogin(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        AdminLoginResponse loginResponse = authService.adminLogin(request);

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        String accessToken = jwtUtil.createAccessToken(user);
        String refreshToken = jwtUtil.createRefreshToken(user);

        ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)
                .secure(false)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        response.addHeader(HttpHeaders.SET_COOKIE, refreshCookie.toString());

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "accessToken", accessToken,
                        "user", loginResponse.getUser(),
                        "profile", loginResponse.getProfile()
                )
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(new ApiResponse<>(true, ""));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse<String>> changePassword(
            @RequestBody @Valid ChangePasswordRequest request
    ) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        String email;
        if (principal instanceof User user) {
            email = user.getEmail();
        } else if (principal instanceof org.springframework.security.core.userdetails.User userDetails) {
            email = userDetails.getUsername();
        } else if (principal instanceof String str) {
            email = str;
        } else {
            throw new RuntimeException("인증된 사용자 정보를 찾을 수 없습니다.");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        authService.changePassword(user.getUserId(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "비밀번호가 변경되었습니다."));
    }

    @PutMapping("/update/{pharmacyId}")
    public ResponseEntity<?> updatePharmacy(
            @PathVariable Long pharmacyId,
            @Valid @RequestBody UpdatePharmacyRequest request) {

        PharmacyProfile updatedProfile = authService.updatePharmacy(pharmacyId, request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "pharmacyId", updatedProfile.getPharmacyId(),
                        "userId", updatedProfile.getUserId(),
                        "pharmacyName", updatedProfile.getPharmacyName(),
                        "bizRegNo", updatedProfile.getBizRegNo(),
                        "representativeName", updatedProfile.getRepresentativeName(),
                        "postcode", updatedProfile.getPostcode(),
                        "address", updatedProfile.getAddress(),
                        "detailAddress", updatedProfile.getDetailAddress(),
                        "contact", updatedProfile.getContact(),
                        "status", updatedProfile.getStatus()
                )
        ));
    }

    @PutMapping("/update/admin/{adminId}")
    public ResponseEntity<?> updateAdmin(
            @PathVariable Long adminId,
            @Valid @RequestBody UpdateAdminRequest request) {

        AdminProfile updatedProfile = authService.updateAdmin(adminId, request);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "adminId", updatedProfile.getAdminId(),
                        "userId", updatedProfile.getUserId(),
                        "adminName", updatedProfile.getAdminName(),
                        "department", updatedProfile.getDepartment()
                )
        ));
    }

}

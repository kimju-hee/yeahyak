package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.*;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.UserRole;
import com.yeahyak.backend.repository.UserRepository;
import com.yeahyak.backend.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<String>> signup(@Valid @RequestBody SignupRequest request) {
        authService.register(request);
        return ResponseEntity.ok(new ApiResponse<>(true, ""));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<String>> login(@Valid @RequestBody LoginRequest request) {
        authService.login(request);
        return ResponseEntity.ok(new ApiResponse<>(true, ""));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<String>> adminLogin(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자가 존재하지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(new ApiResponse<>(false, "비밀번호가 일치하지 않습니다."));
        }

        if (user.getUserRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body(new ApiResponse<>(false, "관리자 권한이 없습니다."));
        }

        return ResponseEntity.ok(new ApiResponse<>(true, ""));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok(new ApiResponse<>(true, ""));
    }

    @PutMapping("/update/{pharmacyId}")
    public ResponseEntity<ApiResponse<String>> updatePharmacy(
            @PathVariable Long pharmacyId,
            @Valid @RequestBody UpdatePharmacyRequest request) {
        authService.updatePharmacy(pharmacyId, request);
        return ResponseEntity.ok(new ApiResponse<>(true, ""));
    }
}

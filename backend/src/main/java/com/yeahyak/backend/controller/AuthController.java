package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.LoginRequest;
import com.yeahyak.backend.dto.SignupRequest;
import com.yeahyak.backend.entity.User;
import com.yeahyak.backend.entity.UserRole;
import com.yeahyak.backend.repository.UserRepository;
import com.yeahyak.backend.service.AuthService;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@Valid @RequestBody SignupRequest request) {
        authService.register(request);
        return ResponseEntity.ok("회원가입이 완료되었습니다. 관리자의 승인을 기다립니다.");
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@Valid @RequestBody LoginRequest request) {
        authService.login(request);
        return ResponseEntity.ok("로그인에 성공했습니다.");
    }

    @PostMapping("/admin/login")
    public ResponseEntity<String> adminLogin(@Valid @RequestBody LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("해당 이메일의 사용자가 존재하지 않습니다."));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body("비밀번호가 일치하지 않습니다.");
        }

        if (user.getUserRole() != UserRole.ADMIN) {
            return ResponseEntity.status(403).body("관리자 권한이 없습니다.");
        }

        return ResponseEntity.ok("관리자 로그인에 성공했습니다.");
    }

    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.ok("로그아웃이 완료되었습니다.");
    }

}

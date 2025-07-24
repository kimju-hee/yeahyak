package com.yeahyak.backend.controller;

import com.yeahyak.backend.dto.LoginRequest;
import com.yeahyak.backend.dto.SignupRequest;
import com.yeahyak.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

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

}

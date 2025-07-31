package com.yeahyak.backend.service;

import com.yeahyak.backend.dto.LoginRequest;
import com.yeahyak.backend.dto.SignupRequest;
import com.yeahyak.backend.dto.UpdatePharmacyRequest;
import com.yeahyak.backend.entity.*;
import org.springframework.security.authentication.AuthenticationManager;
import com.yeahyak.backend.repository.PharmacyRepository;
import com.yeahyak.backend.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
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

    @Transactional
    public void register(SignupRequest request) {
        validateDuplication(request);

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .userRole(UserRole.NONE)
                .build();
        userRepository.save(user);

        Pharmacy pharmacy = Pharmacy.builder()
                .pharmacyName(request.getPharmacyName())
                .bizRegNo(request.getBizRegNo())
                .representativeName(request.getRepresentativeName())
                .address(request.getAddress())
                .phoneNumber(request.getPhoneNumber())
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

    public void login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (AuthenticationException e) {
            throw new IllegalArgumentException("이메일 또는 비밀번호가 올바르지 않습니다.");
        }
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
}

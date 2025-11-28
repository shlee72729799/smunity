package com.example.lsh_community.controller;

import com.example.lsh_community.dto.AuthResponse;
import com.example.lsh_community.dto.EmailVerificationRequest;
import com.example.lsh_community.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 1. 인증 메일 발송 요청
    @PostMapping("/send-verification")
    public ResponseEntity<AuthResponse> sendVerification(@Valid @RequestBody EmailVerificationRequest req) {
        authService.sendVerificationEmail(req.email());
        // 만료 시간(300초) 포함해서 응답
        return ResponseEntity.ok(new AuthResponse("인증 메일이 발송되었습니다.", null, null, 300L));
    }

    // 2. 이메일 링크 클릭 처리 (HTML 반환)
    @GetMapping(value = "/verify-link", produces = "text/html; charset=UTF-8")
    public String verifyLink(@RequestParam String token) {
        return authService.verifyEmailLink(token);
    }

    // 3. 인증 상태 확인 (Polling)
    @GetMapping("/check-status")
    public ResponseEntity<Map<String, String>> checkStatus(@RequestParam String email) {
        String signupToken = authService.checkVerificationStatus(email);

        Map<String, String> response = new HashMap<>();
        if (signupToken != null) {
            response.put("status", "VERIFIED");
            response.put("signupToken", signupToken);
        } else {
            response.put("status", "PENDING");
        }
        return ResponseEntity.ok(response);
    }
}
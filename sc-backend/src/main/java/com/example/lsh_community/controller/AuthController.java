package com.example.lsh_community.controller;

import com.example.lsh_community.dto.AuthResponse;
import com.example.lsh_community.dto.EmailVerificationRequest;
import com.example.lsh_community.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    // 1. 인증 메일 발송 요청
    @PostMapping("/send-verification")
    public ResponseEntity<AuthResponse> sendVerification(@Valid @RequestBody EmailVerificationRequest req) {
        authService.sendVerificationEmail(req.email());

        // [수정] AuthResponse가 인자 3개를 요구하므로, 마지막 token 자리에 null을 추가했습니다.
        return ResponseEntity.ok(new AuthResponse("인증 메일이 발송되었습니다.", null, null));
    }

    // 2. 이메일 링크 클릭 시 처리 (GET)
    @GetMapping("/verify-email")
    public ResponseEntity<Void> verifyEmail(@RequestParam String token) {
        try {
            // 서비스에서 토큰 검증 후 '최종 가입용 토큰'을 받음
            String signupToken = authService.verifyEmail(token);

            // 인증 성공 시 프론트엔드의 회원가입 페이지로 리다이렉트 (토큰 포함)
            // 주의: 프론트엔드 주소(localhost:3000)가 맞는지 확인하세요.
            String redirectUrl = "http://localhost:3000/signup-final?signupToken=" + signupToken;

            HttpHeaders headers = new HttpHeaders();
            headers.setLocation(URI.create(redirectUrl));
            return new ResponseEntity<>(headers, HttpStatus.FOUND); // 302 Redirect

        } catch (IllegalArgumentException e) {
            // 실패 시 에러 페이지로 리다이렉트
            return ResponseEntity.status(HttpStatus.FOUND)
                    .location(URI.create("http://localhost:3000/auth-error")) // 프론트에 이 경로가 없으면 메인(/)으로 보내도 됩니다.
                    .build();
        }
    }
}
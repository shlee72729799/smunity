package com.example.lsh_community.controller;

import com.example.lsh_community.dto.AuthResponse;
import com.example.lsh_community.dto.LoginRequest;
import com.example.lsh_community.dto.SignupRequest;
import com.example.lsh_community.dto.UserResponse;
import com.example.lsh_community.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final com.example.lsh_community.util.JwtUtil jwtUtil; // [추가]

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest req) {
        UserResponse user = userService.signup(req);
        // 회원가입 직후엔 토큰 null (로그인 유도)
        AuthResponse response = new AuthResponse("회원가입이 완료되었습니다", user, null);
        return ResponseEntity
                .created(URI.create("/api/auth/users/" + user.id()))
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        UserResponse user = userService.login(req);

        // [추가] 로그인 성공 시 토큰 생성!
        String token = jwtUtil.generateToken(user.username());

        // 토큰을 응답에 담아보냄
        AuthResponse response = new AuthResponse("로그인 성공", user, token);
        return ResponseEntity.ok(response);
    }
}


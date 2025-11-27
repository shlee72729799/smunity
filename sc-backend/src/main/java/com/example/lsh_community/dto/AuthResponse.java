package com.example.lsh_community.dto;

public record AuthResponse(
        String message,
        UserResponse user,
        String token // [추가] 토큰 필드 생성
) {}
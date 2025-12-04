package com.example.lsh_community.dto;

public record MyPostDto(
        Long id,
        String title,
        String boardName, // "자유게시판" 등
        String boardCode,
        String createdAt
) {}
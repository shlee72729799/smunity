package com.example.lsh_community.dto;

public record MyCommentDto(
        Long id,       // 댓글 ID
        Long postId,   // 게시글 ID (이동용)
        String postTitle, // 게시글 제목
        String content,   // 댓글 내용
        String createdAt
) {}
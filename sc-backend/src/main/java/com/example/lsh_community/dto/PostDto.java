package com.example.lsh_community.dto;

import com.example.lsh_community.domain.Post;

import java.time.LocalDateTime;

public record PostDto(
        Long id,
        String boardCode,
        String title,
        String content,
        long viewCount,
        long likeCount,
        long commentCount,
        LocalDateTime createdAt
) {
    public static PostDto from(Post p) {
        String code = (p.getBoard() != null) ? p.getBoard().getCode() : null;

        return new PostDto(
                p.getId(),
                code,
                p.getTitle(),
                p.getContent(),
                p.getViewCount(),
                p.getLikeCount(),
                p.getCommentCount(),
                p.getCreatedAt()
        );
    }
}

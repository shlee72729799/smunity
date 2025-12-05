package com.example.lsh_community.dto;

import com.example.lsh_community.domain.Post;
import java.time.format.DateTimeFormatter;

public record PostDto(
        Long id,
        String boardCode,
        String title,
        String content,
        long viewCount,
        long likeCount,
        long commentCount,
        String createdAt,
        boolean hasLiked // 내가 좋아요 눌렀는지 여부
) {
    // 상세 조회용
    public static PostDto from(Post p, boolean hasLiked) {
        String code = (p.getBoard() != null) ? p.getBoard().getCode() : null;
        return new PostDto(
                p.getId(),
                code,
                p.getTitle(),
                p.getContent(),
                p.getViewCount(),
                p.getLikeCount(),
                p.getCommentCount(),
                p.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")),
                hasLiked
        );
    }

    // 목록 조회용
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
                p.getCreatedAt().format(DateTimeFormatter.ofPattern("MM-dd HH:mm")), // ✅ 월-일 시:분
                false
        );
    }
}
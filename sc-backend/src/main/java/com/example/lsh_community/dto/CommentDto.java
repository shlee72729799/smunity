package com.example.lsh_community.dto;

import com.example.lsh_community.domain.Comment;
import java.time.format.DateTimeFormatter;

public record CommentDto(
        Long id,
        String content,
        String writerName, // 작성자 이름 (화면에 표시)
        String createdAt,
        boolean isOwner    // 내가 쓴 댓글인지 여부 (삭제 버튼 표시용)
) {
    public static CommentDto from(Comment c, Long currentUserId) {
        return new CommentDto(
                c.getId(),
                c.getContent(),
                c.getAuthor().getNickname(),
                c.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                c.getAuthor().getId().equals(currentUserId)
        );
    }
}
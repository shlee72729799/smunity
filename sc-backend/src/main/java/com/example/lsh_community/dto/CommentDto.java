package com.example.lsh_community.dto;

import com.example.lsh_community.domain.Comment;
import java.time.format.DateTimeFormatter;

public record CommentDto(
        Long id,
        String content,
        String writerName, // 작성자 이름 (화면에 표시)
        String createdAt,
        String updatedAt,
        boolean isOwner    // 내가 쓴 댓글인지 여부 (삭제 버튼 표시용)
) {
    public static CommentDto from(Comment c, Long currentUserId) {
        String boardCode = c.getPost().getBoard().getCode();

        // 댓글 작성자 이름 결정
        String displayWriterName;

        if ("ANON1".equals(boardCode)) {
            displayWriterName = "익명";
        } else {
            displayWriterName = c.isAnonymous() ? "익명" : c.getAuthor().getNickname();
        }

        return new CommentDto(
                c.getId(),
                c.getContent(),
                displayWriterName,
                c.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")),
                c.getUpdatedAt() != null ? c.getUpdatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm")) : null,
                c.getAuthor().getId().equals(currentUserId)
        );
    }
}
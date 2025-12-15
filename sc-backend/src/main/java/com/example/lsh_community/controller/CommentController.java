package com.example.lsh_community.controller;

import com.example.lsh_community.dto.CommentDto;
import com.example.lsh_community.dto.CommentUpdateRequest;
import com.example.lsh_community.dto.CreateCommentRequest;
import com.example.lsh_community.dto.UserResponse;
import com.example.lsh_community.service.CommentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class CommentController {

    private final CommentService commentService;

    // 1. 댓글 작성 (POST /api/posts/{postId}/comments)
    @PostMapping("/posts/{postId}/comments")
    public ResponseEntity<Void> createComment(
            @PathVariable Long postId,
            @RequestBody CreateCommentRequest req,
            HttpServletRequest request
    ) {
        Long userId = getUserIdFromSession(request);
        commentService.createComment(postId, userId, req.content(), req.isAnonymous());
        return ResponseEntity.ok().build();
    }

    // 2. 댓글 목록 조회 (GET /api/posts/{postId}/comments)
    @GetMapping("/posts/{postId}/comments")
    public ResponseEntity<List<CommentDto>> getComments(
            @PathVariable Long postId,
            HttpServletRequest request
    ) {
        // 로그인 안 한 사람도 댓글은 볼 수 있음 (userId = null)
        Long userId = null;
        try { userId = getUserIdFromSession(request); } catch (Exception ignored) {}

        return ResponseEntity.ok(commentService.getComments(postId, userId));
    }

    // 3. 댓글 삭제 (DELETE /api/comments/{commentId})
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable Long commentId,
            HttpServletRequest request
    ) {
        Long userId = getUserIdFromSession(request);
        commentService.deleteComment(commentId, userId);
        return ResponseEntity.ok().build();
    }

    // 세션에서 유저 ID 꺼내는 헬퍼 메서드
    private Long getUserIdFromSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER") == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        UserResponse user = (UserResponse) session.getAttribute("USER");
        return user.id();
    }

    // 댓글 수정
    @PatchMapping("/comments/{commentId}")
    public ResponseEntity<Void> updateComment(@PathVariable Long commentId, @RequestBody CommentUpdateRequest req, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null) return ResponseEntity.status(401).build();
        UserResponse user = (UserResponse) session.getAttribute("USER");

        commentService.updateComment(commentId, user.id(), req.content());
        return ResponseEntity.ok().build();
    }
}
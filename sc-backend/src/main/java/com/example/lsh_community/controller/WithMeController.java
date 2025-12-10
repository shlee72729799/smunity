package com.example.lsh_community.controller;

import com.example.lsh_community.dto.MyWithMeResponse;
import com.example.lsh_community.dto.UserResponse;
import com.example.lsh_community.service.WithMeService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/withme")
@RequiredArgsConstructor
public class WithMeController {

    private final WithMeService withMeService;

    // 참여하기
    @PostMapping("/{postId}/join")
    public ResponseEntity<Void> join(@PathVariable Long postId, HttpServletRequest request) {
        Long userId = getUserIdFromSession(request);
        withMeService.joinWithMe(postId, userId);
        return ResponseEntity.ok().build();
    }

    // 참여 취소
    @PostMapping("/{postId}/cancel")
    public ResponseEntity<Void> cancel(@PathVariable Long postId, HttpServletRequest request) {
        Long userId = getUserIdFromSession(request);
        withMeService.cancelWithMe(postId, userId);
        return ResponseEntity.ok().build();
    }

    // 확정된 내 목록 조회
    @GetMapping("/my-list")
    public ResponseEntity<MyWithMeResponse> getMyWithMeList(HttpServletRequest request) {
        Long userId = getUserIdFromSession(request);
        return ResponseEntity.ok(withMeService.getMyWithMeList(userId));
    }

    private Long getUserIdFromSession(HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        if (session == null || session.getAttribute("USER") == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        UserResponse user = (UserResponse) session.getAttribute("USER");
        return user.id();
    }
}
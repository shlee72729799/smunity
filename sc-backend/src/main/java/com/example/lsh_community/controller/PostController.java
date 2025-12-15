package com.example.lsh_community.controller;

import com.example.lsh_community.dto.CreatePostRequest;
import com.example.lsh_community.dto.PostDto;
<<<<<<< Updated upstream
import com.example.lsh_community.service.PostService;
=======
import com.example.lsh_community.dto.PostUpdateRequest;
import com.example.lsh_community.dto.UserResponse;
import com.example.lsh_community.service.PostService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
>>>>>>> Stashed changes
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
<<<<<<< Updated upstream
@CrossOrigin(origins = "http://localhost:5173")
=======
>>>>>>> Stashed changes
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

<<<<<<< Updated upstream
    // 글 작성
    @PostMapping
    public Long createPost(@RequestBody CreatePostRequest request) {
        return postService.createPost(request);
    }

    // 게시판별 글 목록 (예: /api/posts/board/FREE)
=======
    @PostMapping
    public ResponseEntity<Long> createPost(@RequestBody CreatePostRequest request, HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("USER") == null) {
            return ResponseEntity.status(401).build();
        }
        UserResponse user = (UserResponse) session.getAttribute("USER");
        Long postId = postService.createPost(request, user.id());
        return ResponseEntity.ok(postId);
    }

    // 상세 조회 (세션 확인 후 hasLiked 계산)
    @GetMapping("/{postId}")
    public PostDto getPost(@PathVariable Long postId, HttpServletRequest request) {
        Long userId = null;

        // 로그인했는지 확인 (안 했으면 userId는 null)
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute("USER") != null) {
            UserResponse user = (UserResponse) session.getAttribute("USER");
            userId = user.id();
        }

        return postService.getPostAndIncreaseView(postId, userId);
    }

>>>>>>> Stashed changes
    @GetMapping("/board/{boardCode}")
    public List<PostDto> getPostsByBoard(@PathVariable String boardCode) {
        return postService.getPostsByBoard(boardCode);
    }

<<<<<<< Updated upstream
    // 게시글 상세 조회 + 조회수 증가 (예: /api/posts/1)
    @GetMapping("/{postId}")
    public PostDto getPost(@PathVariable Long postId) {
        return postService.getPostAndIncreaseView(postId);
    }

    // 인기글 TOP10
=======
>>>>>>> Stashed changes
    @GetMapping("/top10")
    public List<PostDto> getTop10Posts() {
        return postService.getTop10Posts();
    }
<<<<<<< Updated upstream
}
=======

    @PostMapping("/{postId}/like")
    public ResponseEntity<Long> likePost(@PathVariable Long postId, HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session == null || session.getAttribute("USER") == null) {
            return ResponseEntity.status(401).build();
        }
        UserResponse user = (UserResponse) session.getAttribute("USER");
        long newCount = postService.toggleLike(postId, user.id());
        return ResponseEntity.ok(newCount);
    }

    // 게시글 수정
    @PatchMapping("/{postId}")
    public ResponseEntity<Void> updatePost(@PathVariable Long postId, @RequestBody PostUpdateRequest req, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        UserResponse user = (UserResponse) session.getAttribute("USER"); // null 체크 생략(간결성)
        postService.updatePost(postId, user.id(), req.title(), req.content());
        return ResponseEntity.ok().build();
    }

    // 게시글 삭제
    @DeleteMapping("/{postId}")
    public ResponseEntity<Void> deletePost(@PathVariable Long postId, HttpServletRequest request) {
        HttpSession session = request.getSession(false);
        UserResponse user = (UserResponse) session.getAttribute("USER");
        postService.deletePost(postId, user.id());
        return ResponseEntity.ok().build();
    }
}
>>>>>>> Stashed changes

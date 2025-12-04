package com.example.lsh_community.controller;

import com.example.lsh_community.dto.CreatePostRequest;
import com.example.lsh_community.dto.PostDto;
import com.example.lsh_community.service.PostService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173")
public class PostController {

    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    // 글 작성
    @PostMapping
    public Long createPost(@RequestBody CreatePostRequest request) {
        return postService.createPost(request);
    }

    // 게시판별 글 목록 (예: /api/posts/board/FREE)
    @GetMapping("/board/{boardCode}")
    public List<PostDto> getPostsByBoard(@PathVariable String boardCode) {
        return postService.getPostsByBoard(boardCode);
    }

    // 게시글 상세 조회 + 조회수 증가 (예: /api/posts/1)
    @GetMapping("/{postId}")
    public PostDto getPost(@PathVariable Long postId) {
        return postService.getPostAndIncreaseView(postId);
    }

    // 인기글 TOP10
    @GetMapping("/top10")
    public List<PostDto> getTop10Posts() {
        return postService.getTop10Posts();
    }
}

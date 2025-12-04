package com.example.lsh_community.service;

import com.example.lsh_community.domain.Board;
import com.example.lsh_community.domain.Post;
import com.example.lsh_community.dto.CreatePostRequest;
import com.example.lsh_community.dto.PostDto;
import com.example.lsh_community.repository.BoardRepository;
import com.example.lsh_community.repository.PostRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final BoardRepository boardRepository;

    public PostService(PostRepository postRepository,
                       BoardRepository boardRepository) {
        this.postRepository = postRepository;
        this.boardRepository = boardRepository;
    }

    // 글 작성
    @Transactional
    public Long createPost(CreatePostRequest request) {
        // 1) 게시판 코드로 Board 찾기
        Board board = boardRepository.findByCode(request.getBoardCode())
                .orElseThrow(() -> new IllegalArgumentException("해당 게시판을 찾을 수 없습니다: " + request.getBoardCode()));

        // TODO: User 연결은 나중에
        Post post = new Post(
                board,
                request.getTitle(),
                request.getContent()
        );
        Post saved = postRepository.save(post);
        return saved.getId();
    }

    // 게시판별 글 목록
    @Transactional(readOnly = true)
    public List<PostDto> getPostsByBoard(String boardCode) {
        return postRepository.findByBoard_CodeOrderByIdDesc(boardCode)
                .stream()
                .map(PostDto::from)
                .collect(Collectors.toList());
    }

    // 인기글 TOP10 (좋아요 desc, 조회수 desc)
    @Transactional(readOnly = true)
    public List<PostDto> getTop10Posts() {
        return postRepository.findTop10ByOrderByLikeCountDescViewCountDesc()
                .stream()
                .map(PostDto::from)
                .collect(Collectors.toList());
    }

    // 상세 조회 + 조회수 증가
    @Transactional
    public PostDto getPostAndIncreaseView(Long postId) {
        Post p = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        p.increaseView(); // 조회수 +1 (JPA가 dirty checking으로 update)

        return PostDto.from(p);
    }
}

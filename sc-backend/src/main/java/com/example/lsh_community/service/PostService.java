package com.example.lsh_community.service;

import com.example.lsh_community.domain.Board;
import com.example.lsh_community.domain.Post;
import com.example.lsh_community.domain.PostLike;
import com.example.lsh_community.dto.CreatePostRequest;
import com.example.lsh_community.dto.PostDto;
import com.example.lsh_community.entity.UserEntity;
import com.example.lsh_community.repository.BoardRepository;
import com.example.lsh_community.repository.PostLikeRepository;
import com.example.lsh_community.repository.PostRepository;
import com.example.lsh_community.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PostService {

    private final PostRepository postRepository;
    private final BoardRepository boardRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;

    public PostService(PostRepository postRepository,
                       BoardRepository boardRepository,
                       UserRepository userRepository,
                       PostLikeRepository postLikeRepository) {
        this.postRepository = postRepository;
        this.boardRepository = boardRepository;
        this.userRepository = userRepository;
        this.postLikeRepository = postLikeRepository;
    }

    @Transactional
    public Long createPost(CreatePostRequest request, Long userId) {
        Board board = boardRepository.findByCode(request.getBoardCode())
                .orElseThrow(() -> new IllegalArgumentException("해당 게시판을 찾을 수 없습니다."));
        UserEntity author = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        Post post = new Post(board, author, request.getTitle(), request.getContent());
        Post saved = postRepository.save(post);
        return saved.getId();
    }

    // 상세 조회 (로그인한 유저 ID를 받아서 좋아요 여부 확인)
    @Transactional
    public PostDto getPostAndIncreaseView(Long postId, Long userId) {
        Post p = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글을 찾을 수 없습니다."));

        p.increaseView(); // 조회수 증가

        boolean hasLiked = false;
        if (userId != null) {
            UserEntity user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                // 좋아요 테이블에 기록이 있는지 확인
                hasLiked = postLikeRepository.findByUserAndPost(user, p).isPresent();
            }
        }

        return PostDto.from(p, hasLiked);
    }

    // 목록 조회
    @Transactional(readOnly = true)
    public List<PostDto> getPostsByBoard(String boardCode) {
        return postRepository.findByBoard_CodeOrderByIdDesc(boardCode)
                .stream().map(PostDto::from).collect(Collectors.toList());
    }

    // TOP10 조회
    @Transactional(readOnly = true)
    public List<PostDto> getTop10Posts() {
        return postRepository.findTop10ByOrderByLikeCountDescViewCountDesc()
                .stream().map(PostDto::from).collect(Collectors.toList());
    }

    // 좋아요 토글
    @Transactional
    public long toggleLike(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 없습니다."));

        Optional<PostLike> existingLike = postLikeRepository.findByUserAndPost(user, post);

        if (existingLike.isPresent()) {
            postLikeRepository.delete(existingLike.get());
            post.updateLikeCount(post.getLikeCount() - 1);
        } else {
            postLikeRepository.save(new PostLike(user, post));
            post.updateLikeCount(post.getLikeCount() + 1);
        }
        return post.getLikeCount();
    }

    // 게시글 수정
    @Transactional
    public void updatePost(Long postId, Long userId, String title, String content) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("작성자만 수정할 수 있습니다.");
        }
        post.update(title, content);
    }

    // 게시글 삭제
    @Transactional
    public void deletePost(Long postId, Long userId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글 없음"));
        if (!post.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("작성자만 삭제할 수 있습니다.");
        }
        postRepository.delete(post);
    }
}
package com.example.lsh_community.service;

import com.example.lsh_community.domain.Comment;
import com.example.lsh_community.domain.Post;
import com.example.lsh_community.dto.CommentDto;
import com.example.lsh_community.entity.UserEntity;
import com.example.lsh_community.repository.CommentRepository;
import com.example.lsh_community.repository.PostRepository;
import com.example.lsh_community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CommentService {

    private final CommentRepository commentRepository;
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    // 댓글 작성
    public void createComment(Long postId, Long userId, String content, boolean isAnonymous) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("유저가 없습니다."));

        Comment comment = new Comment(post, user, content, isAnonymous);
        commentRepository.save(comment);

        post.increaseCommentCount();
    }

    // 댓글 목록 조회
    @Transactional(readOnly = true)
    public List<CommentDto> getComments(Long postId, Long currentUserId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new IllegalArgumentException("게시글이 없습니다."));

        return commentRepository.findAllByPostOrderByIdAsc(post).stream()
                .map(comment -> CommentDto.from(comment, currentUserId))
                .toList();
    }

    // 댓글 수정
    public void updateComment(Long commentId, Long userId, String content) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다."));

        // 작성자 본인 확인
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("작성자만 수정할 수 있습니다.");
        }

        comment.update(content);
    }

    // 댓글 삭제
    public void deleteComment(Long commentId, Long userId) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new IllegalArgumentException("댓글이 없습니다."));

        // 작성자 본인 확인
        if (!comment.getAuthor().getId().equals(userId)) {
            throw new IllegalArgumentException("작성자만 삭제할 수 있습니다.");
        }

        Post post = comment.getPost();
        post.decreaseCommentCount();

        commentRepository.delete(comment);
    }
}
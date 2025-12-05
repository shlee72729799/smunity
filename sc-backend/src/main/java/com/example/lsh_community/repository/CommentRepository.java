package com.example.lsh_community.repository;

import com.example.lsh_community.domain.Comment;
import com.example.lsh_community.domain.Post;
import com.example.lsh_community.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    // 특정 유저가 쓴 댓글 목록
    List<Comment> findAllByAuthorOrderByIdDesc(UserEntity author);

    // CommentRepository.java 내부
    List<Comment> findAllByPostOrderByIdAsc(Post post);

    // 특정 유저(회원탈퇴)가 쓴 모든 댓글 삭제
    void deleteAllByAuthor(UserEntity author);

    // 특정 게시글에 달린 댓글 모두 삭제
    void deleteAllByPost(Post post);
}
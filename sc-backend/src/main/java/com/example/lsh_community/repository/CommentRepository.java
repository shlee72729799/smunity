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
}
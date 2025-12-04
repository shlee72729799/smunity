package com.example.lsh_community.repository;

import com.example.lsh_community.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.lsh_community.entity.UserEntity;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 게시판 코드로 게시글 목록 조회 (최신 글이 위로)
    List<Post> findByBoard_CodeOrderByIdDesc(String code);

    // 좋아요/조회수 기준 TOP 10
    List<Post> findTop10ByOrderByLikeCountDescViewCountDesc();

    // 특정 유저가 쓴 글 목록 (최신순)
    List<Post> findAllByAuthorOrderByIdDesc(UserEntity author);
}

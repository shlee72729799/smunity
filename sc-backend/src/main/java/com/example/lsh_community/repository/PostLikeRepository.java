package com.example.lsh_community.repository;

import com.example.lsh_community.domain.Post;
import com.example.lsh_community.domain.PostLike;
import com.example.lsh_community.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {
    // 이미 좋아요를 눌렀는지 확인
    Optional<PostLike> findByUserAndPost(UserEntity user, Post post);
}
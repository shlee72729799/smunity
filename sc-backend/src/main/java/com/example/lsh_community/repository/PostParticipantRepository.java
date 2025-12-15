package com.example.lsh_community.repository;

import com.example.lsh_community.domain.PostParticipant;
import com.example.lsh_community.domain.Post;
import com.example.lsh_community.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PostParticipantRepository extends JpaRepository<PostParticipant, Long> {
    Optional<PostParticipant> findByPostAndUser(Post post, UserEntity user);
    List<PostParticipant> findAllByPost(Post post);
    boolean existsByPostAndUser(Post post, UserEntity user);
    void deleteAllByPost(Post post); // Post 삭제 시 연쇄 삭제용

    // 내가 참여한 목록 조회용
    List<PostParticipant> findAllByUser(UserEntity user);
}
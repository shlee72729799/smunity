package com.example.lsh_community.repository;

import com.example.lsh_community.domain.WithMeInfo;
import com.example.lsh_community.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WithMeInfoRepository extends JpaRepository<WithMeInfo, Long> {
    Optional<WithMeInfo> findByPost(Post post);
    List<WithMeInfo> findAllByRecruitmentDeadlineBefore(LocalDateTime now);
    void deleteByPost(Post post); // Post 삭제 시 연쇄 삭제용
}
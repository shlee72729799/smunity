package com.example.lsh_community.repository;

import com.example.lsh_community.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.lsh_community.entity.UserEntity;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    // 게시판 코드로 게시글 목록 조회 (최신 글이 위로)
    List<Post> findByBoard_CodeOrderByIdDesc(String code);

    // 좋아요/조회수 기준 TOP 10 (WITHME 게시판 제외)
    List<Post> findTop10ByBoard_CodeNotOrderByLikeCountDescViewCountDesc(String excludedCode);

    // 특정 유저가 쓴 글 목록 (최신순)
    List<Post> findAllByAuthorOrderByIdDesc(UserEntity author);

    // 특정 유저(회원탈퇴)가 쓴 모든 게시글 삭제
    void deleteAllByAuthor(UserEntity author);

    // 제목 또는 내용에 검색 키워드가 포함된 게시글을 최신순으로 조회
    @Query("SELECT p FROM Post p WHERE p.board.code <> 'WITHME' AND (p.title LIKE %:keyword% OR p.content LIKE %:keyword%) ORDER BY p.id DESC")
    List<Post> findByTitleOrContentContainingAndBoardCodeNot(@Param("keyword") String keyword);
}

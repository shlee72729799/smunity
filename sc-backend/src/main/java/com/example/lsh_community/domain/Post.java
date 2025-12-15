package com.example.lsh_community.domain;

import com.example.lsh_community.entity.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "board_id")
    private Board board;

    // 작성자 정보 연결
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private UserEntity author;

    @Column(nullable = false)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String content;

    private long viewCount = 0L;
    private long likeCount = 0L;
    private long commentCount = 0L;
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    private boolean isAnonymous;

    // 생성자 수정 (작성자 포함)
    public Post(Board board, UserEntity author, String title, String content, boolean isAnonymous) {
        this.board = board;
        this.author = author;
        this.title = title;
        this.content = content;
        this.isAnonymous = isAnonymous;
        this.createdAt = LocalDateTime.now();
    }

    public boolean isAnonymous() { return isAnonymous; }

    public void increaseView() { this.viewCount++; }

    // 좋아요 수 변경 메서드
    public void updateLikeCount(long count) {
        this.likeCount = count;
    }

    // 게시글 수정
    public void update(String title, String content) {
        this.title = title;
        this.content = content;
        this.updatedAt = LocalDateTime.now();
    }

    // 댓글 수 증가 메서드
    public void increaseCommentCount() {
        this.commentCount++;
    }

    // 댓글 수 감소 메서드
    public void decreaseCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }
}